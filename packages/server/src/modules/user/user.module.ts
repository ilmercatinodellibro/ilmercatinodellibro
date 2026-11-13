import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module.js";
import { ReceiptModule } from "src/modules/receipt/receipt.module.js";
import { UserAccountResolver } from "src/modules/user/user-account.resolver.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { UserResolver } from "./user.resolver.js";
import { UserService } from "./user.service.js";

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    ConfigModule,
    ReceiptModule,
  ],
  providers: [UserResolver, UserAccountResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
