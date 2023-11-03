import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/@generated";
import { GraphQLContext } from "../auth.models";

export const CurrentUser = createParamDecorator(
  (userProp: keyof User | undefined, executionContext: ExecutionContext) => {
    const gqlExecutionContext = GqlExecutionContext.create(executionContext);
    const context = gqlExecutionContext.getContext<GraphQLContext>();

    return userProp ? context.req.user[userProp] : context.req.user;
  },
);
