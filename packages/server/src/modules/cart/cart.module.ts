import { Module } from "@nestjs/common";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { CartResolver } from "./cart.resolver";

@Module({
  imports: [PrismaModule],
  providers: [CartResolver],
})
export class CartModule {}
