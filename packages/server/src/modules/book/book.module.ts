import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BookResolver } from "./book.resolver";

@Module({
  imports: [PrismaModule],
  providers: [BookResolver],
})
export class BookModule {}
