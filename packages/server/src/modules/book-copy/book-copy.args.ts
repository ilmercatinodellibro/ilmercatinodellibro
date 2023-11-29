import { ArgsType, Field, InputType, Int, PickType } from "@nestjs/graphql";
import { BookCopyCreateWithoutBookInput } from "src/@generated";

@ArgsType()
export class BookCopyQueryArgs {
  @Field(() => Int)
  bookId?: string;
}

@InputType()
export class BookCopyCreateInput {
  @Field(() => String, { nullable: false })
  bookIds!: string[];

  @Field(() => String, { nullable: false })
  ownerId!: string;
}

@InputType()
export class BookCopyUpdateInput extends PickType(
  BookCopyCreateWithoutBookInput,
  ["returnedBy", "id", "donatedAt"],
  InputType,
) {}
