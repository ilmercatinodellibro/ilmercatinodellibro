import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Event, Notification } from "@prisma/client";
import { PushNotificationService } from "../push-notification/push-notification-service.abstract";

export interface NewNotificationPayload {
  event: Event;
  notification: Notification;
}

@Injectable()
export class SendPushNotificationListener {
  constructor(private readonly pushService: PushNotificationService) {}

  @OnEvent("newNotification")
  async handleNewNotification({ event, notification }: NewNotificationPayload) {
    await this.pushService.sendToUsers(
      {
        title: event.name,
        body: event.description,
        icon: "/icons/icon-256x256.png",
        timestamp: event.createdAt.getTime(),
        actions: [
          {
            action: "$open:/reserve-books",
            title: "Book Now",
          },
        ],
      },
      [notification.userId],
    );
  }
}
