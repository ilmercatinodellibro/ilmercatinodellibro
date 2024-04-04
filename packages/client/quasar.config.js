/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const path = require("path");

// Be careful about how/what you expose here, process.env has access to root envs here
require("dotenv-expand").expand(
  require("dotenv").config({
    path: path.join(__dirname, ".env"),
  }),
);

const { configure } = require("quasar/wrappers");

function getVueTscTsconfigPath(isPwa) {
  return path.join(
    "./",
    // We have to ignore /src-pwa in root tsconfig.json because /src-pwa/tsconfig.json doesn't get picked up
    // and cause errors in /src-pwa
    // To have proper type checking in /src-pwa, we use the set of specific configurations when running PWA mode
    isPwa ? "./src-pwa/" : "",
    "./tsconfig.vue-tsc.json",
  );
}

module.exports = configure(function (ctx) {
  return {
    sourceFiles: {
      rootComponent: "src/app.vue",
    },

    eslint: {
      // fix: true,
      // include = [],
      // exclude = [],
      // rawOptions = {},
      // We are using vite-plugin-checker instead of Quasar's built-in ESLint checker
      // because it's much faster(runs in worker thread), more configurable, and has more features (TS checking, vue-tsc, etc.)
      // Quasar will probably start using this plugin in the future (https://github.com/quasarframework/quasar/issues/14448)
      warnings: false,
      errors: false,
    },

    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      "apollo",
      "i18n",
      "apexcharts",
      "refresh-token",
      "in-app-notifications",
      "firebase-messaging",
      "retail-location",
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
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

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      // Keep it in sync with "serve" script inside package.json
      distDir: "../server/client-dist/",

      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16",
      },

      vueRouterMode: "history", // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      viteVuePluginOptions: {
        script: {
          defineModel: true,
        },
      },

      env: {
        GRAPHQL_URL: process.env.GRAPHQL_URL,
        GRAPHQL_WS_URL: process.env.GRAPHQL_WS_URL,

        // the service worker is only available in PWA mode, so force disable it otherwise
        WEB_PUSH_ENABLED: ctx.mode.pwa ? process.env.WEB_PUSH_ENABLED : "false",
        WEB_PUSH_VAPID_KEY: process.env.WEB_PUSH_VAPID_KEY,
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,

        IS_DEMO: ctx.dev ? "true" : process.env.IS_DEMO || "false",
      },
      rawDefine: {
        // As pre-compilation doesn't work, we have to use runtime + compiler version of vue-i18n. (default)
        // The regular compiler version (AOT) violates CSP, so we use the JIT version.
        // JIT compilation doesn't do anything in development, it only produces warnings in browser console.
        // Everything works fine in development without JIT, so we only use it in production.
        __INTLIFY_JIT_COMPILATION__: ctx.prod,
        // When using this option, the app breaks with this error in browser console: `TypeError: Cannot read properties of undefined (reading 't')`
        // __INTLIFY_DROP_MESSAGE_COMPILER__: ctx.prod,
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
            include: path.resolve(__dirname, "./src/i18n/**"),

            // https://github.com/intlify/vue-i18n-next/issues/1059#issuecomment-1646097462
            jitCompilation: true,
            dropMessageCompiler: true,
          },
        ],
        */
        [
          "vite-plugin-checker",
          {
            vueTsc: {
              // This path is provided to tsc via --project flag under the hood
              // This causes problems when on Windows and the name of any folder into the path contains spaces
              // Enclosing the path in double quotes solves the problem for Windows, but breaks it for Linux
              // TODO: open an issue on vue language-tools repo with a repro
              tsconfigPath:
                process.platform === "win32" && __dirname.includes(" ")
                  ? `"${getVueTscTsconfigPath(ctx.mode.pwa)}"`
                  : getVueTscTsconfigPath(ctx.mode.pwa),
            },
            eslint: {
              lintCommand: "eslint --ext .js,.cjs,.mjs,.ts,.vue ./",
            },
            stylelint:
              // Stylelint limits config file search to the current directory on "test" environment for some reason
              // Because of this, it can't find the config file in the monorepo root directory
              // --config arg is broken, similar arguments are not working either
              // So, we simply disable it when running tests, not a big deal
              process.env.NODE_ENV === "test"
                ? undefined
                : { lintCommand: "stylelint ./src/**/*.{scss,css,vue}" },
          },
        ],
        ["@dreamonkey/graphql-codegen-near-operation-file", {}],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
      proxy: {
        [`/${process.env.GRAPHQL_PATH}`]: {
          changeOrigin: true,
          target: process.env.GRAPHQL_DOMAIN,
        },
        // TODO: try to understand why all of these are needed
        // https://github.com/chimurai/http-proxy-middleware/issues/112
        [`/${process.env.GRAPHQL_WS_PATH}`]: {
          changeOrigin: true,
          target: process.env.GRAPHQL_WS_DOMAIN,
          secure: false,
          ws: true,
        },
        ["/receipts"]: {
          changeOrigin: true,
          target: process.env.GRAPHQL_DOMAIN.replace("/graphql", ""),
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
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
      plugins: ["Dialog", "Notify", "LocalStorage"],
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

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: "injectManifest", // or 'generateSW'
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
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
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

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
      contentScripts: ["my-content-script"],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
