import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Profile, Strategy, StrategyOptions } from "passport-facebook";
import { AuthConfiguration, authConfiguration } from "src/config/auth";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { UserService } from "src/modules/user/user.service";

export const FACEBOOK_STRATEGY_NAME = "facebook";

export const FACEBOOK_STRATEGY_ENDPOINT = "auth/facebook/callback";

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  Strategy,
  FACEBOOK_STRATEGY_NAME,
) {
  constructor(
    @Inject(rootConfiguration.KEY)
    readonly rootConfig: RootConfiguration,
    @Inject(authConfiguration.KEY)
    readonly authConfig: AuthConfiguration,

    private readonly userService: UserService,
  ) {
    super({
      clientID: authConfig.facebook.clientId,
      clientSecret: authConfig.facebook.clientSecret,
      callbackURL: `${rootConfig.serverUrl}/${FACEBOOK_STRATEGY_ENDPOINT}`,
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
    const { id, name, emails } = profile;

    if (!name) {
      throw new Error("No name found");
    }

    if (!emails || emails.length === 0) {
      throw new Error("No email found");
    }

    const email = emails[0].value;
    const user = await this.userService.findUserByProvider("FACEBOOK", id);
    if (user) {
      return user;
    }

    await this.userService.createUser(
      {
        firstname: name.givenName,
        lastname: name.familyName,
        email,
        password: Math.random().toString(16),
      },
      true,
      {
        provider: "FACEBOOK",
        providerUserId: id,
      },
    );
  }

  authenticate(req: Request, options?: Record<string, unknown>): void {
    options ??= {};
    options.state = req.query.locationId;
    super.authenticate(req, options);
  }
}
