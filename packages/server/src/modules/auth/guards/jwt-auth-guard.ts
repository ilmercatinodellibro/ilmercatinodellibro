import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "src/modules/auth/decorators/public-route.decorator";

// canActivate requires types from rxjs to be loaded, even if we don't directly use it
import type {} from "rxjs";
import { GraphQLContext } from "../auth.models";
import { JWT_STRATEGY_NAME } from "../strategies/jwt.strategy";

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY_NAME) {
  public constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest(executionContext: ExecutionContext) {
    if (executionContext.getType<GqlContextType>() === "graphql") {
      const gqlExecutionContext = GqlExecutionContext.create(executionContext);
      const context = gqlExecutionContext.getContext<GraphQLContext>();
      return context.req;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return executionContext.switchToHttp().getRequest();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
