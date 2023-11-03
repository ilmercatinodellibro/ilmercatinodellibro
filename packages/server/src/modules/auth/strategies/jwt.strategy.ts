import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/@generated";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { PrismaService } from "src/modules/prisma/prisma.service";

// We return "sub" (subject) claim to align with JWT standard claims, it contains the user id
// Other standard claims are added automatically by jwtService
// See https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export const JWT_STRATEGY_NAME = "jwt";

export const VERIFICATION_TOKEN_EXPIRATION_TIME = "48h";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(
    @Inject(rootConfiguration.KEY)
    rootConfig: RootConfiguration,
    private readonly prisma: PrismaService,
  ) {
    super({
      secretOrKey: rootConfig.applicationSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate({ sub: userId }: JwtPayload): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error(
        "User related to this token has not been found in our system",
      );
    }

    return user;
  }
}
