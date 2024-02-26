import { configDotenv } from "dotenv";
import { expand } from "dotenv-expand";
import type { IGraphQLProject } from "graphql-config";
import { relative, resolve } from "node:path";

const { SERVER_URL } = expand(configDotenv()).parsed ?? {};

// graphql-config expects the paths to be relative to the root config file
const monorepoRoot = resolve(__dirname, "../..");
const toProjectPath = (path: string) =>
  relative(monorepoRoot, resolve(__dirname, path));

export default {
  schema: toProjectPath("./src/@generated/schema.graphql"),

  extensions: {
    endpoints: {
      default: `${SERVER_URL}/graphql`,
    },
  },
} satisfies IGraphQLProject;
