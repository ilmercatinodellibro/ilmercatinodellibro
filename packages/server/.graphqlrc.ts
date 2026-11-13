import { relative, resolve } from "node:path";
import { config } from "@dotenvx/dotenvx";
import type { IGraphQLProject } from "graphql-config";

const { SERVER_URL } = config().parsed ?? {};

// graphql-config expects the paths to be relative to the root config file
const monorepoRoot = resolve(import.meta.dirname, "../..");
const toProjectPath = (path: string) =>
  relative(monorepoRoot, resolve(import.meta.dirname, path));

export default {
  schema: toProjectPath("./src/@generated/schema.graphql"),

  extensions: {
    endpoints: {
      default: `${SERVER_URL}/graphql`,
    },
  },
} satisfies IGraphQLProject;
