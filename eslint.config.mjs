import { join } from "node:path";
import { defineConfig } from "eslint/config";
import configCoralloy from "eslint-config-coralloy";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import globals from "globals";

const projectTsConfig = join(import.meta.dirname, "tsconfig.json");

// This is for root files only, each package has its own config
export default defineConfig(
  ...configCoralloy.configs.base(),

  {
    name: "custom/ignores",

    ignores: ["node_modules/**", "packages/**"],
  },

  {
    name: "custom",

    languageOptions: {
      globals: {
        ...globals.node,
      },

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
);
