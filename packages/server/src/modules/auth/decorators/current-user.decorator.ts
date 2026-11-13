import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { User } from "src/@generated";
import type { GraphQLContext } from "../auth.models";

export const CurrentUser = createParamDecorator(
  (
    userProperty: keyof User | undefined,
    executionContext: ExecutionContext,
  ) => {
    const gqlExecutionContext = GqlExecutionContext.create(executionContext);
    const context = gqlExecutionContext.getContext<GraphQLContext>();

    return userProperty ? context.req.user[userProperty] : context.req.user;
  },
);
