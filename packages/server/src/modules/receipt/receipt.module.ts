import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ReceiptResolver } from "./receipt.resolver";
import { ReceiptService } from "./receipt.service";

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule],
  providers: [ReceiptResolver, ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
