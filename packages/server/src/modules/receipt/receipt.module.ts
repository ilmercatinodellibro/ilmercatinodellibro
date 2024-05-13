import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { MailModule } from "src/modules/mail/mail.module";
import { ReceiptController } from "src/modules/receipt/receipt.controller";
import { RetailLocationModule } from "src/modules/retail-location/retail-location.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ReceiptResolver } from "./receipt.resolver";
import { ReceiptService } from "./receipt.service";

@Module({
  imports: [PrismaModule, AuthModule, MailModule, RetailLocationModule],
  providers: [ReceiptResolver, ReceiptService],
  exports: [ReceiptService],
  controllers: [ReceiptController],
})
export class ReceiptModule {}
