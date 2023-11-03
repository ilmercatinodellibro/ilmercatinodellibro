import { PipeTransform, Type } from "@nestjs/common";
import { Args, ArgsOptions } from "@nestjs/graphql";

/**
 * Decorator that marks a method parameter as an input parameter named as 'input' for a GraphQL mutation.
 * It's created to follow the input best practice for GraphQL mutations in an easier way.
 *
 * It's essentially `@Args('input')` decorator from `@nestjs/graphql` under the hood. So, you can pass the rest of the parameters if needed.
 *
 * @see https://www.apollographql.com/blog/graphql/basics/designing-graphql-mutations/#designing-the-mutation-input for the input best practice
 * @see https://docs.nestjs.com/graphql/resolvers#args-decorator-options for the `@Args()` decorator
 * @see /packages/server/docs/graphql.md for more information about GraphQL guidelines
 *
 * @example
 * ```ts
 * \@Mutation()
 * async createBook(\@Input() input: CreateBookInput) {
 *  // ...
 * }
 * ```
 */
export const Input = (
  options: ArgsOptions = {},
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    Args("input", options, ...pipes)(target, propertyKey, parameterIndex);
  };
};
