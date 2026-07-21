import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { ReceiptModule } from "src/modules/receipt/receipt.module";
import { UserAccountResolver } from "src/modules/user/user-account.resolver";
import { PrismaModule } from "../prisma/prisma.module";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";

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
