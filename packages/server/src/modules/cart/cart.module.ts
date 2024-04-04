import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { ReceiptModule } from "src/modules/receipt/receipt.module";
import { CartResolver } from "./cart.resolver";
import { CartService } from "./cart.service";

@Module({
  imports: [PrismaModule, AuthModule, ReceiptModule],
  providers: [CartResolver, CartService],
  exports: [CartService],
})
export class CartModule {}
