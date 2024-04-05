import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { RetailLocationController } from "src/modules/retail-location/retail-location.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { RetailLocationResolver } from "./retail-location.resolver";

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule],
  providers: [RetailLocationResolver],
  controllers: [RetailLocationController],
})
export class RetailLocationModule {}
