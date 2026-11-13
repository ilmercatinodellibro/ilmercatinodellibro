import { type ConfigType, registerAs } from "@nestjs/config";
import { z } from "./zod";

const databaseSchema = z.object({
  host: z.string(),
  port: z.coerce.number(),
  user: z.string(),
  password: z.string(),
  name: z.string(),
  schema: z.string(),
});

export const databaseConfiguration = registerAs("database", () =>
  databaseSchema.parse({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
  }),
);

export type DatabaseConfiguration = ConfigType<typeof databaseConfiguration>;
