import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { SaleResolver } from "./sale.resolver.js";
import { SaleService } from "./sale.service.js";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [SaleResolver, SaleService],
  exports: [SaleService],
})
export class SaleModule {}
