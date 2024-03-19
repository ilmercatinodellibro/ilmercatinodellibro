import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SaleResolver } from "./sale.resolver";
import { SaleService } from "./sale.service";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [SaleResolver, SaleService],
  exports: [SaleService],
})
export class SaleModule {}
