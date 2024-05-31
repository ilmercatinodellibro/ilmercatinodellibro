import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Event, RetailLocation, User } from "@prisma/client";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { NewNotificationPayload } from "src/modules/notification/send-push-notification.listener";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

type EmailPayload = Pick<Event, "name" | "description" | "createdAt"> & {
  location: RetailLocation;
  locale: string;
};

@Injectable()
export class SendEmailNotificationListener {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  @OnEvent("newNotification")
  async sendEmailAlertOnNotification({
    event,
    notification,
  }: NewNotificationPayload) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: notification.userId,
      },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        locale: true,
      },
    });
    const location = await this.prisma.retailLocation.findUniqueOrThrow({
      where: {
        id: event.locationId,
      },
    });

    await this.#sendEventEmail(user, {
      name: event.name,
      description: event.description,
      createdAt: event.createdAt,
      location,
      locale: user.locale ?? "it",
    });
  }

  async #sendEventEmail(
    user: Pick<User, "firstname" | "lastname" | "email">,
    { name, description, createdAt, location, locale }: EmailPayload,
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
      await this.mailService.sendMail({
        to: `${user.firstname} ${user.lastname} <${user.email}>`,
        subject: eventName,
        context: {
          name: eventName,
          description,
          date,
          reserveUrl,
        },
        template: `${locale}/event-trigger-notification`,
      });
    } catch {
      throw new UnprocessableEntityException("Unable to send email");
    }
  }
}
