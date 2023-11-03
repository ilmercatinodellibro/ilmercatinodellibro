import type { IGraphQLConfig } from "graphql-config";
import { resolve } from "path";

const config: IGraphQLConfig = {
  schema: resolve(__dirname, "./packages/server/src/@generated/schema.graphql"),
  extensions: {
    endpoints: {
      default: `http://localhost:3000/graphql`,
    },
  },
};

export default config;
