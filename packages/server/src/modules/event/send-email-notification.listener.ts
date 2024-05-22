import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Event, RetailLocation } from "@prisma/client";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { NewNotificationPayload } from "src/modules/notification/send-push-notification.listener";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

type EmailPayload = Pick<Event, "name" | "description" | "createdAt"> & {
  location: RetailLocation;
};

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
    const location = await this.prisma.retailLocation.findUniqueOrThrow({
      where: {
        id: event.locationId,
      },
    });

    await this.#sendEventEmail(userEmail, {
      name: event.name,
      description: event.description,
      createdAt: event.createdAt,
      location,
    });
  }

  async #sendEventEmail(
    email: string,
    { name, description, createdAt, location }: EmailPayload,
  ) {
    const reserveUrl = `${this.rootConfig.clientUrl}/${location.id}/reserve-books`;
    const date = createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const eventName = `${name} - ${location.name}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: eventName,
        context: {
          name: eventName,
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
