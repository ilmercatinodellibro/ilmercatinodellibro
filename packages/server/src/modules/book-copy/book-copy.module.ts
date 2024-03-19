import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { BookCopyResolver } from "./book-copy.resolver";
import { BookCopyService } from "./book-copy.service";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BookCopyResolver, BookCopyService],
  exports: [BookCopyService],
})
export class BookCopyModule {}
