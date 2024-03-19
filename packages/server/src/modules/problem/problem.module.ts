import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ProblemResolver } from "./problem.resolver";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ProblemResolver],
})
export class ProblemModule {}
