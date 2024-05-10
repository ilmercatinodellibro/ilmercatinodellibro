import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthConfiguration, authConfiguration } from "src/config/auth";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { FacebookStrategy } from "src/modules/auth/strategies/facebook.strategy";
import { GoogleStrategy } from "src/modules/auth/strategies/google.strategy";
import { UserService } from "src/modules/user/user.service";
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

    // Optional, only enabled if configured
    {
      provide: FacebookStrategy,
      useFactory(
        { serverUrl }: RootConfiguration,
        { facebook }: AuthConfiguration,
        userService: UserService,
      ) {
        if (
          facebook.clientId === undefined ||
          facebook.clientSecret === undefined
        ) {
          return null;
        }

        return new FacebookStrategy(
          {
            clientId: facebook.clientId,
            clientSecret: facebook.clientSecret,
            serverUrl,
          },
          userService,
        );
      },
      inject: [rootConfiguration.KEY, authConfiguration.KEY, UserService],
    },
    // Optional, only enabled if configured
    {
      provide: GoogleStrategy,
      useFactory(
        { serverUrl }: RootConfiguration,
        { google }: AuthConfiguration,
        userService: UserService,
      ) {
        if (
          google.clientId === undefined ||
          google.clientSecret === undefined
        ) {
          return null;
        }

        return new GoogleStrategy(
          {
            clientId: google.clientId,
            clientSecret: google.clientSecret,
            serverUrl,
          },
          userService,
        );
      },
      inject: [rootConfiguration.KEY, authConfiguration.KEY, UserService],
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
