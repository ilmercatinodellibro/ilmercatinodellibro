import { Inject, Injectable, Logger } from "@nestjs/common";
import { type ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import type { SentMessageInfo } from "nodemailer";
import type { UserModel } from "src/@generated/prisma/models";
import { nameAddrSchema } from "src/config/email";
import { RootConfiguration, rootConfiguration } from "src/config/root";

// The mailer package doesn't export its address type, so we take it from the "from" field
type AddressObject = Exclude<NonNullable<ISendMailOptions["from"]>, string>;
type Address =
  string | AddressObject | Pick<UserModel, "email" | "firstname" | "lastname">;
const addressableFields = [
  "to",
  "cc",
  "bcc",
  "replyTo",
  "inReplyTo",
  "from",
  "sender",
] as const;
type AddressableField = (typeof addressableFields)[number];
// We resolve the locale ourselves, so it can be null, unlike the mailer one
export type SendMailOptions = Omit<
  ISendMailOptions,
  AddressableField | "locale"
> & {
  to?: Address | Address[];
  cc?: Address | Address[];
  bcc?: Address | Address[];
  replyTo?: Address | Address[];
  inReplyTo?: Address;
  from?: Address;
  sender?: Address;
  retailLocationId: string;
  // TODO: make this type safe
  locale?: string | null;
};

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  async sendMail(mailDetails: SendMailOptions): Promise<SentMessageInfo> {
    const addressOverrides: Partial<Record<AddressableField, AddressObject>> =
      {};
    try {
      for (const field of addressableFields) {
        const value = mailDetails[field];
        if (value) {
          addressOverrides[field] = this.convertToAddressObject(
            value,
            // some fields are not arrays, so we simply cast them to make TS happy
          ) as AddressObject;
        }
      }

      const i18nMailDetails = this.applyInternationalization(mailDetails);

      // Validating actual existence of these files is hard because we're not dealing with local paths but with URLs
      // Paths change in development and production environments, and even in development they can change if we run different scripts
      const privacyPolicyUrl = `${this.rootConfig.clientUrl}/tos-privacy/privacy-policy-${i18nMailDetails.locale}.pdf`;
      const tosUrl = `${this.rootConfig.clientUrl}/tos-privacy/tos-${i18nMailDetails.retailLocationId}-${i18nMailDetails.locale}.pdf`;

      return await this.mailerService.sendMail({
        ...(i18nMailDetails as ISendMailOptions),
        ...addressOverrides,
        context: {
          privacyPolicyUrl,
          tosUrl,
          ...i18nMailDetails.context,
        },
      });
    } catch (error) {
      Logger.error("Error sending email", "MailService", error);
      throw error;
    }
  }

  private readonly nameAddrPattern = /(?<name>.*) <(?<address>.*)>/;

  private convertToAddressObject(
    value: Address | Address[],
  ): AddressObject | AddressObject[] {
    if (Array.isArray(value)) {
      return value.flatMap((v) => this.convertToAddressObject(v));
    }

    if (typeof value === "string") {
      // If the value is in the format "Name <address>", split it into name and email
      const result = nameAddrSchema.safeParse(value);
      if (result.success) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { groups } = result.data.match(this.nameAddrPattern)!;
        return {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          name: groups!.name,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          address: groups!.address,
        };
      }

      return {
        name: value,
        address: value,
      };
    }

    if ("email" in value && "firstname" in value && "lastname" in value) {
      return {
        name: `${value.firstname} ${value.lastname}`,
        address: value.email,
      };
    }

    return value;
  }

  private applyInternationalization({
    locale: requestedLocale,
    subject,
    template,
    ...mailDetails
  }: SendMailOptions) {
    const locale = requestedLocale ?? "it";

    return {
      locale,
      // TODO: apply i18n here too
      // Check out https://nestjs-i18n.com/
      subject: `Il Mercatino del Libro - ${subject}`,
      template: `${locale}/${template}`,
      ...mailDetails,
    };
  }
}
