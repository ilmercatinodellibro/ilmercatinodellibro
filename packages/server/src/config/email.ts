import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";

export type EmailConfiguration = ConfigType<typeof emailConfiguration>;

// RFC 5322 - name-addr
// Example: John Doe <john@doe.com>
const emailAddressSchema = z.string().email();
export const nameAddrSchema = z.custom<`${string} <${string}>`>((value) => {
  if (typeof value !== "string") {
    return false;
  }

  const [, name, addr] = value.match(/^(.+) <(.+)>$/) ?? [];
  if (!name || !addr) {
    return false;
  }
  return emailAddressSchema.safeParse(addr).success;
});
// RFC 5322 - mailbox (addr-spec or name-addr)
const mailboxSchema = z.union([emailAddressSchema, nameAddrSchema]);

const emailSchema = z.object({
  host: z.string(),
  port: z.coerce.number(),
  isSecure: z.coerce.boolean(),
  user: z.string(),
  pass: z.string(),
  fromDefault: mailboxSchema,
  supportEmail: mailboxSchema,
});

export const emailConfiguration = registerAs("email", () =>
  emailSchema.parse({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    isSecure: process.env.MAIL_SECURE,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    fromDefault: process.env.MAIL_FROM_DEFAULT,
    supportEmail: process.env.MAIL_SUPPORT,
  }),
);
