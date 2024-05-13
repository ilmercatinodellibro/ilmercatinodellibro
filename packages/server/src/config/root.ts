import { resolve } from "node:path";
import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

const rootSchema = z.object({
  nodeEnv: z.nativeEnum(Environment),
  clientUrl: z.string().url(),
  serverUrl: z.string().url(),
  storagePath: z.string().default("./storage"),
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
