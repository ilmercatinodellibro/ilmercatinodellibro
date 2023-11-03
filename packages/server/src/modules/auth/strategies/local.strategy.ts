import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UserService } from "src/modules/user/user.service";

export const LOCAL_STRATEGY_NAME = "local";

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  LOCAL_STRATEGY_NAME,
) {
  constructor(private userService: UserService) {
    super({ usernameField: "email" });
  }

  async validate(username: string, password: string) {
    return this.userService.validateUser(username, password);
  }
}
