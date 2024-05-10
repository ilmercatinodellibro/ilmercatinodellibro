import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Profile, Strategy, StrategyOptions } from "passport-facebook";
import { UserService } from "src/modules/user/user.service";

export const FACEBOOK_STRATEGY_NAME = "facebook";

export const FACEBOOK_STRATEGY_ENDPOINT = "auth/facebook/callback";

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  Strategy,
  FACEBOOK_STRATEGY_NAME,
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
      callbackURL: `${serverUrl}/${FACEBOOK_STRATEGY_ENDPOINT}`,
      enableProof: true,
      scope: ["email"],
      profileFields: ["id", "name", "email"],
    } satisfies StrategyOptions);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    return await this.userService.createFederatedUser({
      ...profile,
      provider: "FACEBOOK",
    });
  }

  authenticate(req: Request, options?: Record<string, unknown>): void {
    options ??= {};
    options.state = req.query.locationId;
    super.authenticate(req, options);
  }
}
