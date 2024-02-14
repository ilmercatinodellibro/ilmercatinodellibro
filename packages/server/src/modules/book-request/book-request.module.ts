import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BookRequestResolver } from "./book-request.resolver";
import { BookRequestService } from "./book-request.service";

@Module({
  imports: [PrismaModule],
  providers: [BookRequestResolver, BookRequestService],
  exports: [BookRequestService],
})
export class BookRequestModule {}
