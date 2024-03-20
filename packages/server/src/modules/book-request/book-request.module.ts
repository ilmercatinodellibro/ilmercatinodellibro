import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { BookRequestResolver } from "./book-request.resolver";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BookRequestResolver],
})
export class BookRequestModule {}
