import { ArgsType, Field, InputType, Int } from "@nestjs/graphql";
import {
  LocationBoundInput,
  LocationBoundQueryArgs,
} from "src/modules/retail-location";

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
export class BookCopyCreateInput extends LocationBoundInput {
  @Field(() => [String], { nullable: false })
  bookIds!: string[];

  @Field(() => String, { nullable: false })
  ownerId!: string;
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
  hasProblem?: boolean;
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
