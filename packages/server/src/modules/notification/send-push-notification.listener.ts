import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Notification } from "src/@generated";
import { PushNotificationService } from "../push-notification/push-notification-service.abstract";

@Injectable()
export class SendPushNotificationListener {
  constructor(private readonly pushService: PushNotificationService) {}

  @OnEvent("newNotification")
  async handleNewNotification(notification: Notification) {
    return;

    // TODO: decide which notifications should be sent via push notifications and to who
    const event = {
      name: "Test",
      description: "test",
      createdAt: new Date(),
    };

    await this.pushService.sendToUsers(
      {
        title: `New Event:  - "${event.name}"`,
        body: `${event.description}`,
        icon: "/icons/icon-256x256.png",
        timestamp: event.createdAt.getTime(),
        requireInteraction: false,
        actions: [
          // TODO: Redirect people to booking page
          {
            action: "$open:/events",
            title: "View Events",
          },
        ],
      },
      [notification.userId],
    );
  }
}
