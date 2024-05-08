import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { NewNotificationPayload } from "src/modules/notification/send-push-notification.listener";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

interface EmailPayload {
  name: string;
  description: string;
  createdAt: Date;
}

@Injectable()
export class SendEmailNotificationListener {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  @OnEvent("newNotification")
  async sendEmailAlertOnNotification({
    event,
    notification,
  }: NewNotificationPayload) {
    const { email: userEmail } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: notification.userId,
      },
      select: {
        email: true,
      },
    });

    await this.#sendEventEmail(userEmail, {
      name: event.name,
      description: event.description,
      createdAt: event.createdAt,
    });
  }

  async #sendEventEmail(
    email: string,
    { name, description, createdAt }: EmailPayload,
  ) {
    const reserveUrl = `${this.rootConfig.clientUrl}/reserve-books`;
    const date = createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: name,
        context: {
          name,
          description,
          date,
          reserveUrl,
        },
        template: "event-trigger-notification",
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }
}
