import { Injectable, Logger } from "@nestjs/common";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
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
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {
    const transporters = mailerService.getTransporters();
    transporters.default.use("compile", htmlToTextPlugin);
  }

  async sendMail(mailDetails: ISendMailOptions): Promise<SentMessageInfo> {
    try {
      return (await this.mailerService.sendMail(
        mailDetails,
      )) as SentMessageInfo;
    } catch (error) {
      Logger.error("Error sending email", "MailService", error);
      return false;
    }
  }
}
