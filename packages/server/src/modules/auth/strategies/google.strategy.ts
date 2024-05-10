import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Profile, Strategy, StrategyOptions } from "passport-google-oauth20";
import { UserService } from "src/modules/user/user.service";

export const GOOGLE_STRATEGY_NAME = "google";

export const GOOGLE_STRATEGY_ENDPOINT = "auth/google/callback";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  GOOGLE_STRATEGY_NAME,
) {
  constructor(
    {
      clientId,
      clientSecret,
      serverUrl,
    }: { clientId: string; clientSecret: string; serverUrl: string },

    private readonly userService: UserService,
  ) {
    super({
      clientID: clientId,
      clientSecret,
      callbackURL: `${serverUrl}/${GOOGLE_STRATEGY_ENDPOINT}`,
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
