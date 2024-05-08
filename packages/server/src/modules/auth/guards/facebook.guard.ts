import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FACEBOOK_STRATEGY_NAME } from "../strategies/facebook.strategy";

@Injectable()
export class FacebookAuthGuard extends AuthGuard(FACEBOOK_STRATEGY_NAME) {}
