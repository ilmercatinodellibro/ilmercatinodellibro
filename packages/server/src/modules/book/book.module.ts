import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ImportBooksCommand } from "src/modules/book/import-books.command";
import { PrismaModule } from "../prisma/prisma.module";
import { BookResolver } from "./book.resolver";

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [BookResolver, ImportBooksCommand],
})
export class BookModule {}
