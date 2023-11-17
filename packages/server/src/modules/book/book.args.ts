import { ArgsType, Field, InputType, Int, OmitType } from "@nestjs/graphql";
import { BookCreateWithoutRetailLocationInput } from "src/@generated";

@ArgsType()
export class BookQueryArgs {
  @Field(() => Int)
  page?: number;
  @Field(() => Int)
  rows?: number;
  @Field({ nullable: true })
  filter?: string;
}

@InputType()
export class BookCreateInput extends OmitType(
  BookCreateWithoutRetailLocationInput,
  ["id"],
  InputType,
) {
  @Field(() => String, { nullable: false })
  retailLocationId!: string;
}
