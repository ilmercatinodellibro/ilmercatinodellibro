import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";

export type EmailConfiguration = ConfigType<typeof emailConfiguration>;

const emailSchema = z.object({
  host: z.string(),
  port: z.coerce.number(),
  user: z.string(),
  pass: z.string(),
  fromDefault: z.string().email(),
  supportEmail: z.string().email(),
});

export const emailConfiguration = registerAs("email", () =>
  emailSchema.parse({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    fromDefault: process.env.MAIL_FROM_DEFAULT,
    supportEmail: process.env.MAIL_SUPPORT,
  }),
);
