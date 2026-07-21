import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BookRequestService } from "src/modules/book-request/book-request.service";
import { AddAdminUserCommand } from "src/modules/user/add-admin-user.command";
import { SeedUsersWithBooksCommand } from "src/modules/user/seed-users-with-books.command";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [
    AddAdminUserCommand,
    SeedUsersWithBooksCommand,
    // TODO: this breaks module segregation, but it's needed to allow SeedUsersWithBooksCommand to generate RequestQueue
    // We should refactor the "@OnEvent("booksBecameAvailable")" bit into a dedicated RequestQueue module and import that instead
    BookRequestService,
  ],
})
export class UserCliModule {}
