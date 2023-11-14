import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BookResolver } from "./book.resolver";
import { BookService } from "./book.service";

@Module({
  imports: [PrismaModule],
  providers: [BookResolver, BookService],
  exports: [BookService],
})
export class BookModule {}
