import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { SchoolResolver } from "./school.resolver.js";

@Module({
  imports: [PrismaModule],
  providers: [SchoolResolver],
})
export class SchoolModule {}
