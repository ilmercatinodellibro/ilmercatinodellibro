import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { cert, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import {
  PushNotificationConfiguration,
  pushNotificationConfiguration,
} from "src/config/push-notification.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { FirebasePushNotificationService } from "./firebase-push-notification.service.js";
import { LocalPushNotificationService } from "./local-push-notification.service.js";
import { PushNotificationService } from "./push-notification-service.abstract.js";
import { PushNotificationResolver } from "./push-notification.resolver.js";
import { VoidPushNotificationService } from "./void-push-notification.service.js";

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forFeature(pushNotificationConfiguration),
  ],
  providers: [
    PushNotificationResolver,
    {
      provide: PushNotificationService,
      useFactory: (
        config: PushNotificationConfiguration,
        prisma: PrismaService,
      ) => {
        switch (config.driver) {
          case "firebase": {
            const firebaseApp = initializeApp({
              credential: cert(config.firebaseCredentials),
            });

            return new FirebasePushNotificationService(
              getMessaging(firebaseApp),
              prisma,
            );
          }
          case "local": {
            return new LocalPushNotificationService();
          }
          case "void": {
            return new VoidPushNotificationService();
          }
        }
      },
      inject: [pushNotificationConfiguration.KEY, PrismaService],
    },
  ],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
