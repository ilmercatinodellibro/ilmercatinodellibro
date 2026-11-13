import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { PrismaModule } from "src/modules/prisma/prisma.module.js";
import { ReceiptModule } from "src/modules/receipt/receipt.module.js";
import { CartResolver } from "./cart.resolver.js";
import { CartService } from "./cart.service.js";

@Module({
  imports: [PrismaModule, AuthModule, ReceiptModule],
  providers: [CartResolver, CartService],
  exports: [CartService],
})
export class CartModule {}
