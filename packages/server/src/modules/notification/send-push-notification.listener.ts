import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Event, Notification } from "@prisma/client";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { PushNotificationService } from "../push-notification/push-notification-service.abstract";

export interface NewNotificationPayload {
  event: Event;
  notification: Notification;
}

@Injectable()
export class SendPushNotificationListener {
  constructor(
    private readonly pushService: PushNotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent("newNotification")
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
