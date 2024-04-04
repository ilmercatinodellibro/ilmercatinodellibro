import { Module } from "@nestjs/common";
import { ImportBooksCommand } from "./import-books.command";

@Module({
  providers: [ImportBooksCommand],
})
export class ImportBooksModule {}
