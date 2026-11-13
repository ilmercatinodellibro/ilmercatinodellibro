import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ProblemResolver } from "./problem.resolver.js";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ProblemResolver],
})
export class ProblemModule {}
