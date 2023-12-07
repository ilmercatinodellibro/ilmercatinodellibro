import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BookCopyResolver } from "./book-copy.resolver";
import { BookCopyService } from "./book-copy.service";
import { ProblemResolver } from "./problem.resolver";
import { SaleResolver } from "./sale.resolver";

@Module({
  imports: [PrismaModule],
  providers: [BookCopyResolver, BookCopyService, ProblemResolver, SaleResolver],
  exports: [BookCopyService],
})
export class BookCopyModule {}
