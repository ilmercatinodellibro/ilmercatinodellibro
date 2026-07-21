import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ImportBooksCommand } from "src/modules/book/import-books.command";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [ImportBooksCommand],
})
export class BookCliModule {}
