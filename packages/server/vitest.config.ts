import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// See https://docs.nestjs.com/recipes/swc#vitest
export default defineConfig({
  plugins: [
    // esbuild, which Vite uses by default, doesn't emit the decorator metadata Nest DI relies on
    // SWC reads the decorator options from tsconfig.json, the module type is set explicitly as the docs recommend
    swc.vite({ module: { type: "es6" } }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: [
      // Vite resolves "graphql" to its ES module build, while Node loads its CommonJS build for Nest.
      // Two copies of GraphQLScalarType make Nest refuse our custom scalars, so both use the CommonJS build.
      { find: /^graphql$/, replacement: "graphql/index.js" },
    ],
  },
  test: {
    root: import.meta.dirname,
    environment: "node",
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/@generated/**"],
    },
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.spec.ts"] },
      },
      {
        extends: true,
        test: {
          name: "e2e",
          include: ["test/**/*.e2e-spec.ts"],
          // Each file boots the whole app, with its queue workers and cron jobs on the same Redis and database
          fileParallelism: false,
        },
      },
    ],
  },
});
