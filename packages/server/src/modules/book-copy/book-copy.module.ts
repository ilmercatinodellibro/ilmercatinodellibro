import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BookCopyResolver } from "./book-copy.resolver";
import { BookCopyService } from "./book-copy.service";

@Module({
  imports: [PrismaModule],
  providers: [BookCopyResolver, BookCopyService],
  exports: [BookCopyService],
})
export class BookCopyModule {}
