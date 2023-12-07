import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  OmitType,
} from "@nestjs/graphql";
import { Book, BookCreateWithoutRetailLocationInput } from "src/@generated";

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

@ObjectType()
export class BookQueryResult {
  @Field(() => Int)
  page!: number;

  @Field(() => String)
  filter!: string;

  @Field(() => Int)
  rowsCount!: number;

  @Field(() => [Book])
  rows!: Book[];
}
