import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ReceiptResolver } from "./receipt.resolver";
import { ReceiptService } from "./receipt.service";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ReceiptResolver, ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
