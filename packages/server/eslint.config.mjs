import { join } from "node:path";
import { defineConfig } from "eslint/config";
import configCoralloy from "eslint-config-coralloy";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import globals from "globals";

const projectTsConfig = join(import.meta.dirname, "tsconfig.json");
const { noDeepRelative, noLodash } = configCoralloy.importPatterns;

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
      },

      parserOptions: {
        projectService: {
          // Dotfiles aren't matched by the tsconfig "include" default
          allowDefaultProject: [
            "eslint.config.*",
            ".*",
            "prisma/nestjs-graphql.config.mjs",
          ],
        },
      },
    },

    rules: {
      "@typescript-eslint/no-extraneous-class": ["error", { allowEmpty: true }],

      // null has special meaning for Prisma and GraphQL
      // Since there is no specific whitelist, we disable this rule
      "unicorn/no-null": "off",

      // Node needs the full path to an index file in ES modules
      "import-x/no-useless-path-segments": ["error", { noUselessIndex: false }],
      "no-restricted-imports": [
        "error",
        { patterns: [noDeepRelative, noLodash] },
      ],
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
    name: "custom/entrypoints",

    files: [
      "src/main.ts",
      "src/repl.ts",
      "src/generate.ts",
      "src/commander.ts",
      "prisma/**/*.ts",
    ],

    rules: {
      // It's fine to use process.exit in entrypoints
      "unicorn/no-process-exit": "off",
    },
  },

  {
    name: "custom/fixtures",

    // The client tests import these fixtures. There, "src/" means the client sources.
    files: ["test/fixtures/**/*.ts"],

    rules: {
      // This replaces the shared options, so deep relative imports are allowed here
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            noLodash,
            {
              group: ["src/*"],
              message:
                "The client tests import this file. In the client, src/ resolves to the client sources. Import server code with a relative path.",
            },
          ],
        },
      ],
    },
  },
);
