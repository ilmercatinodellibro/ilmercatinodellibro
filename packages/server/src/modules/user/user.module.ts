import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { AddAdminUserCommand } from "src/modules/user/commands/add-admin-user.command";
import { SeedUsersWithBooksCommand } from "src/modules/user/commands/seed-users-with-books.command";
import { UploadUsersCommand } from "src/modules/user/commands/sync-users.command";
import { NewsletterContactsService } from "src/modules/user/newsletter-contacts.service";
import { SyncUsersCommand } from "src/modules/user/sync-users.command";
import { UserAccountResolver } from "src/modules/user/user-account.resolver";
import { UserController } from "src/modules/user/user.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), ConfigModule],
  providers: [
    UserResolver,
    UserAccountResolver,
    UserService,
    AddAdminUserCommand,
    SeedUsersWithBooksCommand,
    SyncUsersCommand,
    UploadUsersCommand,
    NewsletterContactsService,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
