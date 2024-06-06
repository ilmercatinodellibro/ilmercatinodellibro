import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { AddAdminUserCommand } from "src/modules/user/add-admin-user.command";
import { UserAccountResolver } from "src/modules/user/user-account.resolver";
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
  ],
  exports: [UserService],
})
export class UserModule {}
