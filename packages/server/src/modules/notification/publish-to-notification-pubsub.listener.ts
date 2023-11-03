import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Notification } from "src/@generated";
import { NotificationPubSub } from "./notification.pubsub";

@Injectable()
export class PublishToNotificationPubSubListener {
  constructor(private readonly pubSub: NotificationPubSub) {}

  @OnEvent("newNotification")
  async handleNewNotification(notification: Notification) {
    await this.pubSub.publish("newNotification", notification);
  }
}
