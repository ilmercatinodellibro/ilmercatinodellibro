import { Inject, Injectable, Logger } from "@nestjs/common";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { User } from "@prisma/client";
import { Address as AddressObject } from "nodemailer/lib/mailer";
import {
  EmailConfiguration,
  emailConfiguration,
  nameAddrSchema,
} from "src/config/email";
import { htmlToTextPlugin } from "src/modules/mail/html-to-text.plugin";

// We should be using the default but it's any so we need to override it
// import { SentMessageInfo } from 'nodemailer';
type SentMessageInfo =
  | {
      accepted: string[];
      envelope: { from: string; to: string };
      envelopeTime: number;
      messageId: string;
      messageSize: number;
      messageTime: number;
      rejected: string[];
      response: string;
    }
  | false;

type Address =
  | string
  | AddressObject
  | Pick<User, "email" | "firstname" | "lastname">;
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
export type SendMailOptions = Omit<ISendMailOptions, AddressableField> & {
  to?: Address | Address[];
  cc?: Address | Address[];
  bcc?: Address | Address[];
  replyTo?: Address | Address[];
  inReplyTo?: Address;
  from?: Address;
  sender?: Address;
};

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(emailConfiguration.KEY)
    private readonly emailConfig: EmailConfiguration,
  ) {
    const transporters = mailerService.getTransporters();
    transporters.default.use("compile", htmlToTextPlugin);
  }

  async sendMail(mailDetails: SendMailOptions): Promise<SentMessageInfo> {
    const addressOverrides: {
      // some fields are not arrays, so we simply use AddressObject to make TS happy
      [key in AddressableField]?: AddressObject;
    } = {};
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

      return (await this.mailerService.sendMail({
        ...(mailDetails as ISendMailOptions),
        ...addressOverrides,
        context: {
          privacyPolicyUrl: this.emailConfig.privacyPolicyUrl,
          ...mailDetails.context,
        },
      })) as SentMessageInfo;
    } catch (error) {
      Logger.error("Error sending email", "MailService", error);
      return false;
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
}
