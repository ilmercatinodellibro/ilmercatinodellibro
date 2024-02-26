import type { IGraphQLConfig } from "graphql-config";

import client from "./packages/client/.graphqlrc";
import server from "./packages/server/.graphqlrc";

export default {
  // Common
  schema: server.schema,
  extensions: {
    ...server.extensions,
  },

  projects: {
    client,
    server,
  },
} satisfies IGraphQLConfig;
