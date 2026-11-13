import { join } from "node:path";
import { defineConfig } from "eslint/config";
import configCoralloy from "eslint-config-coralloy";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import pluginPlaywright from "eslint-plugin-playwright";
import globals from "globals";
import { version as vueVersion } from "vue";

const projectTsConfig = join(import.meta.dirname, "tsconfig.json");

export default defineConfig(
  ...configCoralloy.configs.base(
    ...configCoralloy.configs.vue,
    ...configCoralloy.configs.vueI18n,
  ),

  {
    name: "custom/ignores",

    ignores: [
      "node_modules/**",

      // Quasar CLI related
      ".quasar/**",
      "quasar.config.*.temporary.compiled*",
      "dist/**",
      "src-capacitor/**",
      "src-cordova/**",
      "src-ssr/**",

      // graphql-codegen related
      "src/@generated/**",
      "src/**/*.graphql.ts",

      // Test coverage related
      "coverage/**",
      ".nyc_output/**",

      // Playwright output
      "test-results/**",
      "playwright-report/**",
      "blob-report/**",
    ],
  },

  {
    name: "quasar",

    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
  {
    name: "quasar/node",

    files: ["quasar.config.ts"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    name: "quasar/pwa-service-worker",

    files: ["src-pwa/sw/**/*.ts"],

    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  {
    name: "custom/vue",

    files: ["**/*.vue"],
    rules: {
      "vue/no-unsupported-features": ["error", { version: vueVersion }],

      // It suggests useTemplateRef(), which is only available since Vue 3.5
      // TODO: enable when upgrading to Vue 3.5
      "vue/prefer-use-template-ref": "off",
    },
  },

  {
    name: "custom",

    rules: {
      // It suggests Array#toSorted(), which needs Firefox 115, while the "baseline-widely-available"
      // build.target of the quasar.config file still includes Firefox 114 (as of Vite 8)
      // TODO: enable when build.target no longer includes Firefox 114
      "unicorn/no-array-sort": "off",
    },

    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: [projectTsConfig],
        }),
      ],
      // import-x treats the nearest package.json as the package root, and src-pwa has its own.
      // Without this, "@/" imports in src-pwa count as external packages.
      // "@/" and "~/" can never be npm package names, so they always mean a local alias.
      // TODO: move this to eslint-config-coralloy
      "import-x/internal-regex": "^[@~]/",
    },
  },

  {
    name: "custom/pages-and-layouts",

    files: ["src/layouts/**/*.vue", "src/pages/**/*.vue"],
    rules: {
      // Pages and layouts are not used as components directly by developers,
      // so they don't necessarily need to have multi word component names
      "vue/multi-word-component-names": "off",
    },
  },

  {
    name: "custom/dialogs",

    files: ["src/**/*-dialog.vue"],

    rules: {
      // Quasar Dialog plugin custom components are created one-off, so `props` isn't reactive
      "vue/no-setup-props-reactivity-loss": "off",
    },
  },

  {
    name: "custom/playwright",

    files: ["test/playwright/**/*.ts"],
    extends: [
      // Add Playwright-specific lint rules and globals
      // See https://github.com/playwright-community/eslint-plugin-playwright#rules
      pluginPlaywright.configs["flat/recommended"],
    ],

    rules: {
      // The helpers of test/playwright/utils assert on behalf of the test which
      // calls them. The rule only knows the names it is given.
      "playwright/expect-expect": [
        "warn",
        {
          assertFunctionNames: [
            "expectLoginRefused",
            "fieldShouldHaveError",
            "openForgotPasswordForm",
          ],
        },
      ],
    },
  },

  {
    name: "custom/playwright-imports",

    // The fixtures directory is the one place that imports test and expect from the AE
    files: ["test/playwright/**/*.ts"],
    ignores: ["test/playwright/fixtures/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@playwright/test",
              importNames: ["test", "expect"],
              message: "Import test and expect from test/playwright/fixtures.",
            },
            {
              name: "@quasar/quasar-app-extension-testing-playwright",
              importNames: ["test", "expect"],
              message: "Import test and expect from test/playwright/fixtures.",
            },
          ],
        },
      ],
    },
  },
);
