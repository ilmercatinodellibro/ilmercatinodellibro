import "@dotenvx/dotenvx/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    seed: "pnpm run-ts prisma/seeds/index.ts",
  },
  // External tables are still a Preview feature
  experimental: {
    externalTables: true,
  },
  tables: {
    // A database view (see the BookMeta model), Prisma Migrate must not create or alter it
    external: ["public.BookMeta"],
  },
});
