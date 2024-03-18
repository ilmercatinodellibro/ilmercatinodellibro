import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ProblemResolver } from "./problem.resolver";

@Module({
  imports: [PrismaModule],
  providers: [ProblemResolver],
})
export class ProblemModule {}
