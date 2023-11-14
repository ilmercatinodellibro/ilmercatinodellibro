import { Field, InputType, OmitType } from "@nestjs/graphql";
import { BookCreateWithoutRetailLocationInput } from "src/@generated";

@InputType()
export class BookQueryPayload {
  @Field()
  page?: number;
  @Field()
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
