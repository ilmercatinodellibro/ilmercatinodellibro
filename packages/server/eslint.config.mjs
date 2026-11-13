import { join } from "node:path";
import { defineConfig } from "eslint/config";
import configCoralloy from "eslint-config-coralloy";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import globals from "globals";

const projectTsConfig = join(import.meta.dirname, "tsconfig.json");

export default defineConfig(
  ...configCoralloy.configs.base(),

  {
    name: "custom/ignores",

    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "client-dist/**",
      "src/@generated/**",
    ],
  },

  {
    name: "custom",

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parserOptions: {
        projectService: {
          // Dotfiles aren't matched by the tsconfig "include" default
          allowDefaultProject: [".*"],
        },
      },
    },

    rules: {
      "@typescript-eslint/no-extraneous-class": ["error", { allowEmpty: true }],

      // null has special meaning for Prisma and GraphQL
      // Since there is no specific whitelist, we disable this rule
      "unicorn/no-null": "off",
    },

    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: [projectTsConfig],
        }),
      ],
    },
  },
);
