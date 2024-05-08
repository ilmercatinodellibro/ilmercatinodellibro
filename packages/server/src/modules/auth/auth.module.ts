import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { MailModule } from "../mail/mail.module";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { JWT_STRATEGY_NAME, JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (rootConfig: RootConfiguration) => ({
        secret: rootConfig.applicationSecret,
        signOptions: {
          expiresIn: rootConfig.tokenExpirationTime,
        },
      }),
      inject: [rootConfiguration.KEY],
    }),
    PassportModule.register({
      defaultStrategy: JWT_STRATEGY_NAME,
      session: false,
    }),
    PrismaModule,
    MailModule,
    forwardRef(() => UserModule),
  ],
  providers: [AuthResolver, AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
