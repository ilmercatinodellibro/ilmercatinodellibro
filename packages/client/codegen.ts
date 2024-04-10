import { unlink } from "node:fs/promises";
import os from "node:os";
import { join, resolve } from "node:path";
import glob from "fast-glob";
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "../server/src/@generated/schema.graphql",
  documents: [
    "src/**/!(*.graphql.ts)*.{graphql,ts,vue}",
    "!src/@generated/**/*",
  ],
  config: {
    scalars: {
      Timestamp: "number",
      DateTime: "string",
      Void: "undefined",
      ISBN: "string",
      HexColorCode: "string",
    },
  },
  generates: {
    "src/@generated/graphql.ts": {
      plugins: [
        {
          typescript: {
            enumsAsTypes: true,
          },
        },
      ],
    },
    "src/@generated/apollo-helpers.ts": {
      plugins: ["typescript-apollo-client-helpers"],
    },
    "src/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".graphql.ts",
        baseTypesPath: "@generated/graphql.ts",
      },
      plugins: [
        {
          "typescript-operations": {
            useTypeImports: true,
            inlineFragmentTypes: "combine",
            dedupeOperationSuffix: true,
          },
        },
        "typed-document-node",
        "@dreamonkey/graphql-codegen-vue-apollo-plugin",
      ],
    },
  },
  hooks: {
    /**
     * Remove files that are no longer being generated.
     * This often happens when switching branches where a feature was added/removed.
     * Otherwise, they will cause linting errors during development.
     * Not simply deleting all files to avoid re-triggering file watchers unnecessarily.
     *
     * @param filePaths array of file paths(relative&absolute mixed) that will be written
     */
    async beforeAllFileWrite(...filePaths: string[]) {
      // https://github.com/mrmlnc/fast-glob/tree/3.2.12#how-to-write-patterns-on-windows
      const normalizePaths = (paths: string[]) =>
        paths.map((path) => path.replace(/\\/g, "/"));

      const pathsToStay = filePaths.map((file) => resolve(__dirname, file));

      const sources = [
        join(__dirname, "./src/@generated/**/*"),
        join(__dirname, "./src/**/*.graphql.ts"),
      ];
      const orphanPaths = await glob(normalizePaths(sources), {
        ignore: normalizePaths(pathsToStay),
      });
      await Promise.all(orphanPaths.map((path) => unlink(path.toString())));
    },
    afterAllFileWrite: [
      // 'eslint --fix' // ESLint has a ~3 seconds initial boot(?) time, it's not worth waiting for it, especially when launching the dev server
      // The OS type check is introduced because there is a problem generated by a fix applied in this PR here
      // https://github.com/dotansimha/graphql-code-generator/pull/8383#issuecomment-1287319942
      ...(os.platform() !== "win32" ? ["prettier --write"] : []),
    ],
  },
};

export default config;
