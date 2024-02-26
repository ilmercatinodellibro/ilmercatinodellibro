import type { IGraphQLProject } from "graphql-config";
import { relative, resolve } from "node:path";
import server from "../server/.graphqlrc";

// graphql-config expects the paths to be relative to the root config file
const monorepoRoot = resolve(__dirname, "../..");
const toProjectPath = (path: string) =>
  relative(monorepoRoot, resolve(__dirname, path));

export default {
  schema: [
    server.schema,

    // Client-side schemas, enable if needed:
    // relativeToRoot('./src/apollo/schemas/**/*.graphql')
  ],

  documents:
    // Vue files have syntax highlight but do not have other crucial features such as auto-complete :/ See: https://github.com/graphql/vscode-graphql/issues/410
    toProjectPath("./src/**/!(*.graphql.ts)*.{js,ts,vue,graphql}"),
  // All document files except the client-side schema files. If using client-side schemas, use this instead:
  // './src/*/!(apollo/schemas)/**/*.{js,ts,vue,graphql}',
} satisfies IGraphQLProject;
