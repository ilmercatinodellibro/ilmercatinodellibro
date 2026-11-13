import { resolve } from "node:path";
import { type ConfigType, registerAs } from "@nestjs/config";
import * as z from "zod/mini";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

const rootSchema = z.object({
  nodeEnv: z.enum(Environment),
  clientUrl: z.url(),
  serverUrl: z.url(),
  storagePath: z.prefault(z.string(), "./storage"),
});

export const rootConfiguration = registerAs("root", () => {
  const config = rootSchema.parse({
    nodeEnv: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
    serverUrl: process.env.SERVER_URL,
    storagePath: process.env.STORAGE_PATH,
  });

  config.storagePath = resolve(process.cwd(), config.storagePath);

  return config;
});

export type RootConfiguration = ConfigType<typeof rootConfiguration>;
