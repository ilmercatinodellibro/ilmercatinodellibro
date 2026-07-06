import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { ImportBooksAndSchoolsService } from "src/modules/book/import-books-and-schools.service";
import { ImportBooksCommand } from "src/modules/book/import-books.command";
import { PrismaModule } from "../prisma/prisma.module";
import { BookResolver } from "./book.resolver";

@Module({
  imports: [PrismaModule, ConfigModule, AuthModule],
  providers: [BookResolver, ImportBooksCommand, ImportBooksAndSchoolsService],
})
export class BookModule {}
