import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SaleResolver } from "./sale.resolver";
import { SaleService } from "./sale.service";

@Module({
  imports: [PrismaModule],
  providers: [SaleResolver, SaleService],
  exports: [SaleService],
})
export class SaleModule {}
