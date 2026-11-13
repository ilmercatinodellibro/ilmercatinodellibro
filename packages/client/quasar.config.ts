// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { existsSync, readFileSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "#q-app";
import vitePluginChecker from "vite-plugin-checker";

type VitePluginCheckerOptions = Parameters<typeof vitePluginChecker>[0];

// Playwright sets it when it starts "quasar dev", see playwright.config.ts
const IS_TEST_RUN = import.meta.env.QUASAR_TESTING_PLAYWRIGHT;

const SERVER_RELATIVE_PATH = "../server";
// Keep it in sync with "serve" script inside package.json
const CLIENT_DIST_PATH = `${SERVER_RELATIVE_PATH}/client-dist/`;
const CLIENT_DIST_HOT_SWAP_PATH = `${SERVER_RELATIVE_PATH}/client-dist-hot-swap/`;
const CLIENT_DIST_BACKUP_PATH = `${SERVER_RELATIVE_PATH}/client-dist-backup/`;

const NODE_VERSION = readFileSync(
  join(import.meta.dirname, "../../.node-version"),
  "utf8",
).trim();

export default defineConfig((ctx) => {
  // Use a hot swap mechanism to avoid a service downtime while deploying a new client bundle
  // The variable comes from the shell (see the "build:pwa:hot-swap" script), not from .env
  const BUILD_WITH_HOT_SWAP =
    ctx.prod && process.env.BUILD_WITH_HOT_SWAP === "true";

  // The generated ImportMetaEnv types the variables as the client code sees them, after "defineEnv" below.
  // In this file, app-vite replaces each "import.meta.env.KEY" with the .env value as a JS literal:
  // true/false become booleans, digit-only values become numbers, and unset variables are undefined
  // (see "getStrDefineValue" in @quasar/app-vite/lib/utils/env.js).
  // A bare "import.meta.env" is always "{}", so the keys must be read one by one.
  const FACEBOOK_LOGIN_ENABLED =
    (import.meta.env.FACEBOOK_LOGIN_ENABLED as boolean | undefined) === true;
  const GOOGLE_LOGIN_ENABLED =
    (import.meta.env.GOOGLE_LOGIN_ENABLED as boolean | undefined) === true;
  const WEB_PUSH_ENABLED =
    (import.meta.env.WEB_PUSH_ENABLED as boolean | undefined) === true;
  const FIREBASE_MESSAGING_SENDER_ID = import.meta.env
    .FIREBASE_MESSAGING_SENDER_ID as string | number | undefined;

  return {
    sourceFiles: {
      rootComponent: "src/app.vue",
    },

    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      "apollo",
      "i18n",
      "refresh-token",
      "in-app-notifications",
      "firebase-messaging",
      "retail-location",
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: ["app.scss"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // "mdi-v7",
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!
      "roboto-font", // optional, you are not bound to it
      // "material-icons", // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      distDir: BUILD_WITH_HOT_SWAP
        ? CLIENT_DIST_HOT_SWAP_PATH
        : CLIENT_DIST_PATH,
      // The server serves the bundle, so it's built into the server package
      allowOutsideProjectDistDir: true,

      afterBuild() {
        // Backup the existing dist folder, then perform the hot-swap
        if (!BUILD_WITH_HOT_SWAP || !existsSync(CLIENT_DIST_HOT_SWAP_PATH)) {
          return;
        }

        // eslint-disable-next-line no-console
        console.log("Hot-swapping the dist folder...");

        if (existsSync(CLIENT_DIST_BACKUP_PATH)) {
          rmSync(CLIENT_DIST_BACKUP_PATH, { recursive: true, force: true });
        }

        if (existsSync(CLIENT_DIST_PATH)) {
          renameSync(CLIENT_DIST_PATH, CLIENT_DIST_BACKUP_PATH);
        }

        renameSync(CLIENT_DIST_HOT_SWAP_PATH, CLIENT_DIST_PATH);
      },

      target: {
        browser: "baseline-widely-available",
        node: `node${NODE_VERSION}`,
      },

      vueRouterMode: "history", // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      vueOptionsAPI: false,

      // publicPath: '/',
      // analyze: true,
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},

      typescript: {
        strict: true,
        vueShim: true,
        extendTsConfig(tsConfig) {
          tsConfig.compilerOptions = {
            ...tsConfig.compilerOptions,

            // This makes everything extremely problematic to deal with due to external types not being
            // set up with this in mind, including Quasar's component prop types
            exactOptionalPropertyTypes: false,

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            paths: {
              ...tsConfig.compilerOptions?.paths,

              // @vue/apollo-composable doesn't expose all the types needed for DM graphql-codegen-stack
              "@vue/apollo-composable/dist/*": [
                "./../node_modules/@vue/apollo-composable/dist/*",
              ],
            },
          };

          tsConfig.include = [
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...tsConfig.include!,

            // Dotfiles aren't matched by the default patterns, include them so ESLint type-checks them with this project
            "./../.*",
          ];
        },
      },

      define: {
        // As pre-compilation doesn't work, we have to use runtime + compiler version of vue-i18n. (default)
        // The regular compiler version (AOT) violates CSP, so we use the JIT version.
        // JIT compilation doesn't do anything in development, it only produces warnings in browser console.
        // Everything works fine in development without JIT, so we only use it in production.
        __INTLIFY_JIT_COMPILATION__: ctx.prod,
        // When using this option, the app breaks with this error in browser console: `TypeError: Cannot read properties of undefined (reading 't')`
        // __INTLIFY_DROP_MESSAGE_COMPILER__: ctx.prod,
      },

      // Passing down to UI code from the quasar.config file
      defineEnv: {
        GRAPHQL_URL: import.meta.env.GRAPHQL_URL,
        GRAPHQL_WS_URL: import.meta.env.GRAPHQL_WS_URL,

        // the service worker is only available in PWA mode, so force disable it otherwise
        WEB_PUSH_ENABLED: ctx.mode.pwa && WEB_PUSH_ENABLED,
        WEB_PUSH_VAPID_KEY: import.meta.env.WEB_PUSH_VAPID_KEY,
        FIREBASE_API_KEY: import.meta.env.FIREBASE_API_KEY,
        FIREBASE_APP_ID: import.meta.env.FIREBASE_APP_ID,
        // Firebase expects a string, while a digit-only sender ID arrives as a number
        FIREBASE_MESSAGING_SENDER_ID: FIREBASE_MESSAGING_SENDER_ID?.toString(),
        FIREBASE_PROJECT_ID: import.meta.env.FIREBASE_PROJECT_ID,

        SOCIAL_LOGIN_ENABLED: FACEBOOK_LOGIN_ENABLED || GOOGLE_LOGIN_ENABLED,
        FACEBOOK_LOGIN_ENABLED,
        GOOGLE_LOGIN_ENABLED,
      },

      vitePlugins: [
        /*
        Pre-compilation doesn't work for TS files properly: https://github.com/intlify/bundle-tools/issues/266
        On top of that, we are using extra variable declarations and similar stuff, which seems to be incompatible with pre-compilation.
        As the documentation is not clear, it's hard to tell the limitations of this plugin, or whether it's a known limitation or a bug.
        Because of that, we don't know which features, code quality, etc. we have to give up to make it work.
        It throws syntax errors in the generated code.
        So, since we can't use pre-compilation, it doesn't make sense to use this plugin at all.
        // TODO: try to use this plugin again when the issues are fixed
        [
          "@intlify/unplugin-vue-i18n/vite",
          {
            // you need to set i18n resource paths
            include: join(import.meta.dirname, "./src/i18n/**"),

            // https://github.com/intlify/vue-i18n-next/issues/1059#issuecomment-1646097462
            jitCompilation: true,
            dropMessageCompiler: true,
          },
        ],
        */
        [
          vitePluginChecker,
          {
            vueTsc: true,
            typescript: {
              tsconfigPath: "./src-pwa/sw/tsconfig.json",
            },
            eslint: {
              // We have to specify paths/patterns, otherwise it crashes or doesn't work on file updates
              // Relevant: https://github.com/fi3ework/vite-plugin-checker/issues/462#issuecomment-2724798908
              lintCommand: 'eslint --cache "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
            stylelint: {
              lintCommand: "stylelint --cache ./src/**/*.{scss,css,vue}",
            },
          } satisfies VitePluginCheckerOptions,
          // The error overlay would cover the page the tests drive
          { client: !IS_TEST_RUN, server: false },
        ],
        ["@dreamonkey/graphql-codegen-near-operation-file", {}],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
      proxy: {
        [`/${import.meta.env.GRAPHQL_PATH}`]: {
          changeOrigin: true,
          target: import.meta.env.GRAPHQL_DOMAIN,
        },
        // TODO: try to understand why all of these are needed
        // https://github.com/chimurai/http-proxy-middleware/issues/112
        [`/${import.meta.env.GRAPHQL_WS_PATH}`]: {
          changeOrigin: true,
          target: import.meta.env.GRAPHQL_WS_DOMAIN,
          secure: false,
          ws: true,
        },

        "/receipts": {
          changeOrigin: true,
          target: import.meta.env.GRAPHQL_DOMAIN,
        },
        "/location": {
          changeOrigin: true,
          target: import.meta.env.GRAPHQL_DOMAIN,
        },
        "/auth": {
          changeOrigin: true,
          target: import.meta.env.GRAPHQL_DOMAIN,
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {},

      iconSet: "svg-mdi-v7", // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ["Dialog", "Notify", "LocalStorage", "Loading"],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [
      "fadeInDown",
      "fadeInUp",
      "fadeOutUp",
      "slideInLeft",
      "slideOutRight",
      "fadeIn",
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/app.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-sw',
    //   pwaServiceWorker: 'src-pwa/sw/custom-sw',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload',
    //   bexManifestFile: 'src-bex/manifest.json',
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // pwaOfflineHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (rolldownConf) {},
      // extendSSRPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if import.meta.env.PORT is specified at runtime)

      middlewares: [
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: "InjectManifest", // or 'GenerateSW'
      injectPWAMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendPWAGenerateSWOptions (cfg) {}
      extendPWAInjectManifestOptions(cfg) {
        // The server answers /location/:id/logo/:name from its storage, also through the dev proxy,
        // so these public files are never served. Fetching them for the precache fails, which discards the service worker.
        cfg.globIgnores ??= [];
        cfg.globIgnores.push("location/**");
      },
      // extendPWAManifestJson (json) {}
      // extendPWACustomSWConf (rolldownConf) {}
      // extendPWASwTsConfig (tsConfig) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (rolldownConf)
      // extendElectronPreloadConf (rolldownConf)

      inspectPort: 5858,

      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      // builder: {
      //   // https://www.electron.build/configuration/configuration

      //   appId: "@ilmercatinodellibro/client",
      // },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      extraScripts: [],

      // extendBexScriptsConf (rolldownConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
