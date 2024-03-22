import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ReceiptResolver } from "./receipt.resolver";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ReceiptResolver],
})
export class ReceiptModule {}
