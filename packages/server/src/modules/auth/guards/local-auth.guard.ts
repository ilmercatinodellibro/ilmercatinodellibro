import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import { GraphQLContext } from "../auth.models";
import { LOCAL_STRATEGY_NAME } from "../strategies/local.strategy";

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_STRATEGY_NAME) {
  getRequest(executionContext: ExecutionContext) {
    if (executionContext.getType<GqlContextType>() === "graphql") {
      const gqlExecutionContext = GqlExecutionContext.create(executionContext);
      const context = gqlExecutionContext.getContext<GraphQLContext>();

      // LocalStrategy isn't equipped to support GraphQL and it expects to find username and password into the body
      // We extract the credentials from the GraphQL input field
      const { input } = executionContext.getArgs()[1] as {
        // We can't strongly type the input as LoginPayload as `req.body` needs a string index signature
        input: Record<string, string>;
      };
      context.req.body = input;

      return context.req;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return executionContext.switchToHttp().getRequest();
  }
}
