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
  @Field({
    nullable: true,
    description:
      'Relative path to the logo, can be fetched by using `GET location/:id/logo/:name` through <img :src="theme.logo" />',
  })
  logo?: string;

  @Field(() => ThemeColors)
  colors!: ThemeColors;
}

@InputType()
export class ThemeInput {
  @Field({ nullable: true })
  resetLogo?: boolean;

  @Field(() => ThemeColorsInput, { nullable: true })
  colors?: ThemeColorsInput;
}

@InputType()
export class UpdateRetailLocationThemeInput extends LocationBoundInput {
  @Field()
  theme!: ThemeInput;
}
