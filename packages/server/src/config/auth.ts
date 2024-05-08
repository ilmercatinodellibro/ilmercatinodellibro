import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";

const authSchema = z.object({
  applicationSecret: z.string(),
  tokenExpirationTime: z.string(),

  facebook: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
  }),
});

export const authConfiguration = registerAs("auth", () =>
  authSchema.parse({
    applicationSecret: process.env.APPLICATION_SECRET,
    tokenExpirationTime: process.env.TOKEN_EXPIRATION_TIME,
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
  }),
);

export type AuthConfiguration = ConfigType<typeof authConfiguration>;
