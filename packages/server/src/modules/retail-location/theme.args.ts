import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { GraphQLHexColorCode } from "graphql-scalars";
import { LocationBoundInput } from "src/modules/retail-location/retail-location.args";

@ObjectType()
export class Theme {
  @Field(() => GraphQLHexColorCode)
  primary!: string;

  @Field(() => GraphQLHexColorCode)
  secondary!: string;

  @Field(() => GraphQLHexColorCode)
  accent!: string;
}

@InputType()
export class ThemeInput extends PartialType(Theme, InputType) {}

@InputType()
export class UpdateRetailLocationThemeInput extends LocationBoundInput {
  @Field()
  theme!: ThemeInput;
}
