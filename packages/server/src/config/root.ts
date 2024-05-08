import { join } from "node:path";
import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

const rootSchema = z.object({
  nodeEnv: z.nativeEnum(Environment),
  applicationSecret: z.string(),
  tokenExpirationTime: z.string(),
  clientUrl: z.string().url(),
  serverUrl: z.string().url(),
  fileSystemPath: z.string().default(join(process.cwd(), "tmp-files")),
});

export const rootConfiguration = registerAs("root", () =>
  rootSchema.parse({
    nodeEnv: process.env.NODE_ENV,
    applicationSecret: process.env.APPLICATION_SECRET,
    tokenExpirationTime: process.env.TOKEN_EXPIRATION_TIME,
    clientUrl: process.env.CLIENT_URL,
    serverUrl: process.env.SERVER_URL,
    fileSystemPath: process.env.OS_FILESYSTEM_PATH,
  }),
);

export type RootConfiguration = ConfigType<typeof rootConfiguration>;
