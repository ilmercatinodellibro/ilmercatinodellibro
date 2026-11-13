import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { User } from "src/@generated/graphql/index.js";
import type { GraphQLContext } from "../auth.models.js";

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
