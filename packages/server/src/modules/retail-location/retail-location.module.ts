import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { RetailLocationController } from "src/modules/retail-location/retail-location.controller";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service";
import { PrismaModule } from "../prisma/prisma.module";
import { RetailLocationResolver } from "./retail-location.resolver";

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule],
  providers: [RetailLocationResolver, RetailLocationService],
  exports: [RetailLocationService],
  controllers: [RetailLocationController],
})
export class RetailLocationModule {}
