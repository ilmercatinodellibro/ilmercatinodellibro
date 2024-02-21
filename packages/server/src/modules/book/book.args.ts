import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Book, BookCreateWithoutRetailLocationInput } from "src/@generated";

@InputType()
export class BookQueryFilter {
  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => Boolean, { nullable: true })
  isAvailable?: boolean;
}

@ArgsType()
export class BookQueryArgs {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  rows?: number;

  @Field(() => BookQueryFilter, { nullable: true })
  filter?: BookQueryFilter;
}

@InputType()
export class BookCreateInput extends BookCreateWithoutRetailLocationInput {
  @Field(() => String, { nullable: false })
  retailLocationId!: string;
}

@ObjectType()
export class BookQueryResult {
  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  rowsCount!: number;

  @Field(() => [Book])
  rows!: Book[];
}
