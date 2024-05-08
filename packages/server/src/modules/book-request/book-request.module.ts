import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { BookRequestService } from "src/modules/book-request/book-request.service";
import { PrismaModule } from "../prisma/prisma.module";
import { BookRequestResolver } from "./book-request.resolver";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BookRequestResolver, BookRequestService],
})
export class BookRequestModule {}
