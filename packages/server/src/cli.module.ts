import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { authConfiguration } from "src/config/auth.js";
import { brevoConfiguration } from "src/config/brevo.js";
import { databaseConfiguration } from "src/config/database.js";
import { emailConfiguration } from "src/config/email.js";
import { queueConfiguration } from "src/config/queue.js";
import { rootConfiguration } from "src/config/root.js";

import { BookCliModule } from "src/modules/book/book-cli.module.js";
import { UserCliModule } from "src/modules/user/user-cli.module.js";
import { PrismaModule } from "./modules/prisma/prisma.module.js";

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
