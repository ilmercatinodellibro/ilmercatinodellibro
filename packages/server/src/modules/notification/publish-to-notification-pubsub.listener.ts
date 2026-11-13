import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { NEW_NOTIFICATION_EVENT } from "./notification.events.js";
import { NotificationPubSub } from "./notification.pubsub.js";
import type { NewNotificationPayload } from "./send-push-notification.listener.js";

@Injectable()
export class PublishToNotificationPubSubListener {
  constructor(private readonly pubSub: NotificationPubSub) {}

  @OnEvent(NEW_NOTIFICATION_EVENT)
  async handleNewNotification({ notification }: NewNotificationPayload) {
    await this.pubSub.publish("newNotification", notification);
  }
}
