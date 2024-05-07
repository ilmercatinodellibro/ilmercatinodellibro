import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { PrismaExceptionFilter } from "src/modules/prisma/prisma-exception.filter";
import { PrismaService } from "./prisma.service";

@Module({
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
