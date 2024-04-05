import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { GraphQLHexColorCode } from "graphql-scalars";
import { LocationBoundInput } from "src/modules/retail-location/retail-location.args";

@ObjectType()
export class ThemeColors {
  @Field(() => GraphQLHexColorCode)
  primary!: string;

  @Field(() => GraphQLHexColorCode)
  secondary!: string;

  @Field(() => GraphQLHexColorCode)
  accent!: string;
}

@InputType()
export class ThemeColorsInput extends PartialType(ThemeColors, InputType) {}

@ObjectType()
export class Theme {
  @Field({ nullable: true })
  logo?: string;

  @Field(() => ThemeColors)
  colors!: ThemeColors;
}

@InputType()
export class ThemeInput {
  @Field(() => ThemeColorsInput, { nullable: true })
  colors?: ThemeColorsInput;
}

@InputType()
export class UpdateRetailLocationThemeInput extends LocationBoundInput {
  @Field()
  theme!: ThemeInput;
}
