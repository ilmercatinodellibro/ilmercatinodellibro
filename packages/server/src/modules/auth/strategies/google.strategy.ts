import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Profile, Strategy, StrategyOptions } from "passport-google-oauth20";
import { AuthConfiguration, authConfiguration } from "src/config/auth";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { UserService } from "src/modules/user/user.service";

export const GOOGLE_STRATEGY_NAME = "google";

export const GOOGLE_STRATEGY_ENDPOINT = "auth/google/callback";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  GOOGLE_STRATEGY_NAME,
) {
  constructor(
    @Inject(rootConfiguration.KEY)
    readonly rootConfig: RootConfiguration,
    @Inject(authConfiguration.KEY)
    readonly authConfig: AuthConfiguration,

    private readonly userService: UserService,
  ) {
    super({
      clientID: authConfig.google.clientId,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: `${rootConfig.serverUrl}/${GOOGLE_STRATEGY_ENDPOINT}`,
      scope: ["profile", "email"],
    } satisfies StrategyOptions);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    return await this.userService.createFederatedUser({
      ...profile,
      provider: "GOOGLE",
    });
  }

  authenticate(req: Request, options?: Record<string, unknown>): void {
    options ??= {};
    options.state = req.query.locationId;
    super.authenticate(req, options);
  }
}
