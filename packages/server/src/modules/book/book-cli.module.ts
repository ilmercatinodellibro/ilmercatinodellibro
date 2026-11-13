import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ImportBooksCommand } from "src/modules/book/import-books.command.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [ImportBooksCommand],
})
export class BookCliModule {}
