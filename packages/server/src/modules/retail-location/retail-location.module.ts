import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RetailLocationResolver } from "./retail-location.resolver";

@Module({
  imports: [PrismaModule],
  providers: [RetailLocationResolver],
})
export class RetailLocationModule {}
