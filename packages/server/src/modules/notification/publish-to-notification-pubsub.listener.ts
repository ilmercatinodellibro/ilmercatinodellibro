import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Notification } from "src/@generated/graphql/index.js";
import { NEW_NOTIFICATION_EVENT } from "./notification.events.js";
import { NotificationPubSub } from "./notification.pubsub.js";

@Injectable()
export class PublishToNotificationPubSubListener {
  constructor(private readonly pubSub: NotificationPubSub) {}

  @OnEvent(NEW_NOTIFICATION_EVENT)
  async handleNewNotification(notification: Notification) {
    await this.pubSub.publish("newNotification", notification);
  }
}
