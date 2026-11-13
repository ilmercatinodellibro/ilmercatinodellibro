import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { ReceiptModule } from "src/modules/receipt/receipt.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { BookCopyResolver } from "./book-copy.resolver.js";
import { BookCopyService } from "./book-copy.service.js";

@Module({
  imports: [PrismaModule, AuthModule, ReceiptModule],
  providers: [BookCopyResolver, BookCopyService],
  exports: [BookCopyService],
})
export class BookCopyModule {}
