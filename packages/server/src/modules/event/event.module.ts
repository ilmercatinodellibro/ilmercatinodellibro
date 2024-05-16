import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailModule } from "../mail/mail.module";
import { NotificationModule } from "../notification/notification.module";
import { PrismaModule } from "../prisma/prisma.module";
import { EventResolver } from "./event.resolver";
import { SendEmailNotificationListener } from "./send-email-notification.listener";

@Module({
  imports: [PrismaModule, MailModule, NotificationModule, ConfigModule],
  providers: [EventResolver, SendEmailNotificationListener],
})
export class EventModule {}
