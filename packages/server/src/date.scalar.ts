/**
 * Override the default Date scalar to use GraphQLTimestamp from graphql-scalars.
 * It is superior as it also supports number and string as input as apposed to only Date.
 * This is especially useful as we are also storing dates in Prisma JSON fields, which are
 * returned as-is, without being parsed into a Date object.
 *
 * Setting it through buildSchemaOptions.scalarsMap doesn't work for some reason,
 * probably only applies to Date due to the exclusive option `dateScalarMode`.
 *
 * @see https://docs.nestjs.com/graphql/scalars#override-a-default-scalar
 */

import { CustomScalar, Scalar } from "@nestjs/graphql";
import { ValueNode } from "graphql";
import { GraphQLTimestamp } from "graphql-scalars";

@Scalar("Timestamp", () => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = GraphQLTimestamp.description ?? "";

  serialize(value: unknown) {
    return GraphQLTimestamp.serialize(value);
  }

  parseValue(value: unknown) {
    return GraphQLTimestamp.parseValue(value);
  }

  parseLiteral(ast: ValueNode) {
    return GraphQLTimestamp.parseLiteral(ast);
  }
}
