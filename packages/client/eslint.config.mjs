import { join } from "node:path";
import { defineConfig } from "eslint/config";
import configCoralloy from "eslint-config-coralloy";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import pluginCypress from "eslint-plugin-cypress";
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

    files: ["quasar.config.js"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // @quasar/app-vite 1 loads quasar.config.js as CommonJS
      // TODO: remove when migrating to an ESM/TS Quasar config
      "unicorn/prefer-module": "off",
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
    },
  },

  {
    name: "custom",

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
    name: "custom/cypress",

    files: ["**/*.cy.{js,jsx,ts,tsx}"],
    extends: [
      // Add Cypress-specific lint rules, globals and Cypress plugin
      // See https://github.com/cypress-io/eslint-plugin-cypress#rules
      pluginCypress.configs.recommended,
    ],

    rules: {
      // Allow chai-style assertions, e.g. `expect(foo).to.be.true`
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
);
