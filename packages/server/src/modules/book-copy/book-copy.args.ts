import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { BookCopy } from "src/@generated";
import { LocationBoundQueryArgs } from "src/modules/retail-location";

@ArgsType()
export class BookCopyQueryArgs {
  @Field(() => String)
  bookId!: string;
}

@ArgsType()
export class BookCopyByUserQueryArgs extends LocationBoundQueryArgs {
  @Field(() => String)
  userId!: string;
}

@InputType()
export class BookCopyQueryFilter {
  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => Boolean, { nullable: true })
  isAvailable?: boolean;

  @Field(() => Boolean, { nullable: true })
  isSold?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasProblems?: boolean;
}

@ArgsType()
export class PaginatedBookCopiesQueryArgs extends LocationBoundQueryArgs {
  @Field(() => Int)
  page!: number;

  @Field(() => Int, { nullable: true })
  rows?: number;

  @Field(() => BookCopyQueryFilter, { nullable: true })
  filter?: BookCopyQueryFilter;
}

@ObjectType()
export class PaginatedBookCopyQueryResult {
  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  rowsCount!: number;

  @Field(() => [BookCopy])
  rows!: BookCopy[];
}
