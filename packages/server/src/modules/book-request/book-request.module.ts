import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BookRequestResolver } from "./book-request.resolver";

@Module({
  imports: [PrismaModule],
  providers: [BookRequestResolver],
})
export class BookRequestModule {}
