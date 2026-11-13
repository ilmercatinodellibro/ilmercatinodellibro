import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { NewsletterContactsService } from "src/modules/retail-location/newsletter-contacts.service.js";
import { RetailLocationController } from "src/modules/retail-location/retail-location.controller.js";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { RetailLocationResolver } from "./retail-location.resolver.js";

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), ConfigModule],
  providers: [
    RetailLocationResolver,
    RetailLocationService,
    NewsletterContactsService,
  ],
  exports: [RetailLocationService],
  controllers: [RetailLocationController],
})
export class RetailLocationModule {}
