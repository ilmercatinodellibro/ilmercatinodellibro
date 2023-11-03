import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PushNotificationModule } from "../push-notification/push-notification.module";
import { NotificationPubSub } from "./notification.pubsub";
import { NotificationResolver } from "./notification.resolver";
import { PublishToNotificationPubSubListener } from "./publish-to-notification-pubsub.listener";
import { SendPushNotificationListener } from "./send-push-notification.listener";

// This can't be used with @OnEvent() for some reason, use @OnEvent("newNotification") instead
// and use this only when emitting the event
export const NEW_NOTIFICATION_EVENT = "newNotification";

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
