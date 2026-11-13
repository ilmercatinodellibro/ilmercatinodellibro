import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  databaseConfiguration,
  DatabaseConfiguration,
} from "src/config/database";
import { PrismaExceptionFilter } from "src/modules/prisma/prisma-exception.filter";
import { PrismaService } from "./prisma.service";

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
