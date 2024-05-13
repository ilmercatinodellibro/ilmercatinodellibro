import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SchoolResolver } from "./school.resolver";

@Module({
  imports: [PrismaModule],
  providers: [SchoolResolver],
})
export class SchoolModule {}
