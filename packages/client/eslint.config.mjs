import { join } from "node:path";
import { defineConfig } from "eslint/config";
import configCoralloy from "eslint-config-coralloy";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
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

    files: ["quasar.config.js", "postcss.config.js"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // @quasar/app-vite 1 loads quasar.config.js as CommonJS, and the package isn't "type": "module"
      // TODO: remove when migrating to ESM configs
      "unicorn/prefer-module": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    name: "quasar/pwa-service-worker",

    files: ["src-pwa/custom-service-worker.ts"],

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
      // It suggests Array#toSorted(), which needs Chrome 110, Firefox 115 and Safari 16,
      // while quasar.config.js build.target still includes older browsers
      // TODO: enable when raising build.target
      "unicorn/no-array-sort": "off",
    },

    languageOptions: {
      parserOptions: {
        projectService: {
          // Dotfiles aren't matched by the tsconfig "include" default
          allowDefaultProject: [".*"],
        },
      },
    },

    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: [projectTsConfig],
        }),
      ],
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
);
