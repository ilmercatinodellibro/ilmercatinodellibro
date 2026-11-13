import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { MailModule } from "src/modules/mail/mail.module.js";
import { ReceiptController } from "src/modules/receipt/receipt.controller.js";
import { RetailLocationModule } from "src/modules/retail-location/retail-location.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ReceiptResolver } from "./receipt.resolver.js";
import { ReceiptService } from "./receipt.service.js";

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    MailModule,
    RetailLocationModule,
  ],
  providers: [ReceiptResolver, ReceiptService],
  exports: [ReceiptService],
  controllers: [ReceiptController],
})
export class ReceiptModule {}
