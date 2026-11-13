import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import type {
  EventModel,
  NotificationModel,
} from "src/@generated/prisma/models.js";
import { PrismaService } from "src/modules/prisma/prisma.service.js";
import { PushNotificationService } from "../push-notification/push-notification-service.abstract.js";
import { NEW_NOTIFICATION_EVENT } from "./notification.events.js";

export interface NewNotificationPayload {
  event: EventModel;
  notification: NotificationModel;
}

@Injectable()
export class SendPushNotificationListener {
  constructor(
    private readonly pushService: PushNotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(NEW_NOTIFICATION_EVENT)
  async handleNewNotification({ event, notification }: NewNotificationPayload) {
    const location = await this.prisma.retailLocation.findUniqueOrThrow({
      where: {
        id: event.locationId,
      },
    });

    await this.pushService.sendToUsers(
      {
        title: `${event.name} - ${location.name}`,
        body: event.description,
        icon: "/icons/icon-256x256.png",
        timestamp: event.createdAt.getTime(),
        actions: [
          {
            action: `$open:/${location.id}/reserve-books`,
            title: "Book Now",
          },
        ],
      },
      [notification.userId],
    );
  }
}
