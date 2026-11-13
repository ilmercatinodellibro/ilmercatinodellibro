import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { ImportBooksAndSchoolsService } from "src/modules/book/import-books-and-schools.service.js";
import { ImportBooksCommand } from "src/modules/book/import-books.command.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { BookResolver } from "./book.resolver.js";

@Module({
  imports: [PrismaModule, ConfigModule, AuthModule],
  providers: [BookResolver, ImportBooksCommand, ImportBooksAndSchoolsService],
})
export class BookModule {}
