import { ArgsType, Field, InputType, Int, OmitType } from "@nestjs/graphql";
import { BookCreateWithoutRetailLocationInput } from "src/@generated";

@ArgsType()
export class BookQueryArgs {
  @Field(() => Int)
  page?: number;
  @Field(() => Int)
  rows?: number;
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

/*

@Field(() => String, { nullable: false })
  isbnCode!: string;

  @Field(() => String, { nullable: false })
  subject!: string;

  @Field(() => String, { nullable: false })
  authorsFullName!: string;

  @Field(() => String, { nullable: false })
  title!: string;

  @Field(() => Number, { nullable: false })
  originalPrice!: number;

  @Field(() => String, { nullable: false })
  publisherName!: string;

  @Field(() => String, { nullable: false })
  retailLocationId!: string;

*/
