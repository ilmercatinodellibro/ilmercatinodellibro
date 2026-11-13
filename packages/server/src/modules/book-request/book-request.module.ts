import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { BookRequestService } from "src/modules/book-request/book-request.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { BookRequestResolver } from "./book-request.resolver.js";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BookRequestResolver, BookRequestService],
})
export class BookRequestModule {}
