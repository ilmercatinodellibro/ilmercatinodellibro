import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  databaseConfiguration,
  DatabaseConfiguration,
} from "src/config/database.js";
import { PrismaExceptionFilter } from "src/modules/prisma/prisma-exception.filter.js";
import { PrismaService } from "./prisma.service.js";

@Module({
  imports: [ConfigModule.forFeature(databaseConfiguration)],
  providers: [
    {
      provide: PrismaService,
      inject: [databaseConfiguration.KEY],
      useFactory(config: DatabaseConfiguration) {
        const adapter = new PrismaPg(
          {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.name,
            // pg waits forever and drops idle connections after 10s by default, Prisma 6 used these values
            // See https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/connection-pool#prisma-orm-v7-driver-adapter-defaults
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 300_000,
          },
          {
            schema: config.schema,
          },
        );

        return new PrismaService({
          adapter,
        });
      },
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
