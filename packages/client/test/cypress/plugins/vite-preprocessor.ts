import { basename, dirname, extname } from "node:path";
import { clone } from "lodash"; // lodash-es doesn't work for some reason
import { RollupWatcher } from "rollup";
import {
  mergeConfig,
  build as viteBuild,
  type BuildOptions,
  type UserConfig,
} from "vite";

/**
 * @see https://github.com/quasarframework/quasar-testing/blob/fa2a0f88d4cba1f0583c00a5b03845ae2c1fd976/packages/e2e-cypress/src/helpers/cct-dev-server/index.ts#L12-L77
 */
async function extractViteConfigFromQuasar() {
  const { default: extensionRunner } = await import(
    "@quasar/app-vite/lib/app-extension/extensions-runner"
  );
  const { default: getQuasarCtx } = await import(
    "@quasar/app-vite/lib/helpers/get-quasar-ctx"
  );
  const { default: QuasarConfFile } = await import(
    "@quasar/app-vite/lib/quasar-config-file"
  );

  const ctx = getQuasarCtx({
    mode: "spa",
    target: undefined,
    debug: false,
    dev: true,
    prod: false,
  });

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile({ ctx });

  const quasarConf = await quasarConfFile.read();
  if (quasarConf.error !== undefined) {
    console.error(quasarConf.error);
  }

  const { default: generateConfig } = await import(
    "@quasar/app-vite/lib/modes/spa/spa-config"
  );

  return generateConfig.vite(quasarConf) as UserConfig;
}

/**
 * @see https://adamlynch.com/preprocess-cypress-tests-with-vite/
 * @see https://github.com/adam-lynch/preprocess-cypress-tests-with-vite/blob/ac44df8193ce009091c3b53b0371b5d916d2ae4f/cypress/plugins/index.js#L16-L79
 * @see https://github.com/mammadataei/cypress-vite (doesn't accept vite config, only accepts vite config file path)
 */
export function vitePreprocessor() {
  /** filePath to outputPath mapping */
  const cache = new Map<string, string>();

  const baseViteConfigPromise = extractViteConfigFromQuasar();

  return async (file: Cypress.FileObject) => {
    const { filePath, outputPath, shouldWatch } = file;

    if (cache.has(filePath)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return cache.get(filePath)!;
    }

    const filename = basename(outputPath);
    const filenameWithoutExtension = basename(outputPath, extname(outputPath));

    const buildOverrides: Partial<BuildOptions> = {
      outDir: dirname(outputPath),
      write: true,
      emptyOutDir: false,
      watch: shouldWatch ? {} : null,
      minify: false,
      sourcemap: true,
    };

    if (filename.endsWith(".html")) {
      buildOverrides.rollupOptions = {
        input: {
          [filenameWithoutExtension]: filePath,
        },
      };
    } else {
      buildOverrides.lib = {
        entry: filePath,
        fileName: () => filename,
        formats: ["es"],
        name: filenameWithoutExtension,
      };
    }

    const result = await viteBuild(
      mergeConfig(clone(await baseViteConfigPromise), {
        build: buildOverrides,
      }),
    );
    if (shouldWatch) {
      const watcher = result as unknown as RollupWatcher;
      watcher.on("event", (event) => {
        if (event.code === "END") {
          file.emit("rerun");
        }
      });
      file.on("close", async () => {
        cache.delete(filePath);
        await watcher.close();
      });
    }

    cache.set(filePath, outputPath);

    return outputPath;
  };
}
