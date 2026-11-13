import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailModule } from "../mail/mail.module.js";
import { NotificationModule } from "../notification/notification.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { EventResolver } from "./event.resolver.js";
import { SendEmailNotificationListener } from "./send-email-notification.listener.js";

@Module({
  imports: [PrismaModule, MailModule, NotificationModule, ConfigModule],
  providers: [EventResolver, SendEmailNotificationListener],
})
export class EventModule {}
