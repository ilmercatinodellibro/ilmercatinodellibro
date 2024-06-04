import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GOOGLE_STRATEGY_NAME } from "../strategies/google.strategy";

@Injectable()
export class GoogleAuthGuard extends AuthGuard(GOOGLE_STRATEGY_NAME) {}
