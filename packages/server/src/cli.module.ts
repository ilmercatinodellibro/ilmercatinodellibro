import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { authConfiguration } from "src/config/auth";
import { brevoConfiguration } from "src/config/brevo";
import { databaseConfiguration } from "src/config/database";
import { emailConfiguration } from "src/config/email";
import { queueConfiguration } from "src/config/queue";
import { rootConfiguration } from "src/config/root";

import { BookCliModule } from "src/modules/book/book-cli.module";
import { UserCliModule } from "src/modules/user/user-cli.module";
import { PrismaModule } from "./modules/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        rootConfiguration,
        authConfiguration,
        databaseConfiguration,
        emailConfiguration,
        queueConfiguration,
        brevoConfiguration,
      ],
      expandVariables: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    BookCliModule,
    UserCliModule,
  ],
})
export class CliModule {}
