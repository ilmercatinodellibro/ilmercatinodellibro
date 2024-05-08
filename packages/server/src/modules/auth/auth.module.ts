import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthConfiguration, authConfiguration } from "src/config/auth";
import { FacebookStrategy } from "src/modules/auth/strategies/facebook.strategy";
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
      useFactory: (authConfig: AuthConfiguration) => ({
        secret: authConfig.applicationSecret,
        signOptions: {
          expiresIn: authConfig.tokenExpirationTime,
        },
      }),
      inject: [authConfiguration.KEY],
    }),
    PassportModule.register({
      defaultStrategy: JWT_STRATEGY_NAME,
      session: false,
    }),
    PrismaModule,
    MailModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    AuthResolver,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
