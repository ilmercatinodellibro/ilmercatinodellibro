import {
  ArgsType,
  Field,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
  PickType,
} from "@nestjs/graphql";
import { Book } from "src/@generated";
import { BookCopyQueryFilter } from "src/modules/book-copy/book-copy.args";
import {
  LocationBoundInput,
  LocationBoundQueryArgs,
} from "src/modules/retail-location";

@InputType()
export class BookQueryFilter extends BookCopyQueryFilter {
  @Field(() => [String], { nullable: true })
  schoolCodes?: string[];

  @Field(() => [String], { nullable: true })
  schoolCourseIds?: string[];
}

@ArgsType()
export class BookQueryArgs extends LocationBoundQueryArgs {
  @Field(() => Int)
  page!: number;

  @Field(() => Int, { nullable: true })
  rows?: number;

  @Field(() => BookQueryFilter, { nullable: true })
  filter?: BookQueryFilter;

  @Field(() => Boolean, { nullable: true })
  copiesInStock?: boolean;
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

@InputType()
export class BookCreateInput extends IntersectionType(
  PickType(
    Book,
    [
      "isbnCode",
      "title",
      "subject",
      "authorsFullName",
      "publisherName",
      "originalPrice",
    ],
    InputType,
  ),
  LocationBoundInput,
  InputType,
) {}
