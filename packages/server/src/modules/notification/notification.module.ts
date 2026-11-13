import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PushNotificationModule } from "../push-notification/push-notification.module.js";
import { NotificationPubSub } from "./notification.pubsub.js";
import { NotificationResolver } from "./notification.resolver.js";
import { PublishToNotificationPubSubListener } from "./publish-to-notification-pubsub.listener.js";
import { SendPushNotificationListener } from "./send-push-notification.listener.js";

@Module({
  imports: [PrismaModule, PushNotificationModule],
  providers: [
    NotificationResolver,
    NotificationPubSub,
    PublishToNotificationPubSubListener,
    SendPushNotificationListener,
  ],
  exports: [NotificationPubSub],
})
export class NotificationModule {}
