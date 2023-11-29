import { ArgsType, Field, InputType, PickType } from "@nestjs/graphql";
import { BookCopyCreateWithoutBookInput } from "src/@generated";

@ArgsType()
export class BookCopyQueryArgs {
  @Field(() => String)
  bookId?: string;
}

@ArgsType()
export class BookCopyByOwnerQueryArgs {
  @Field(() => String)
  ownerId?: string;
}

@InputType()
export class BookCopyCreateInput {
  @Field(() => [String], { nullable: false })
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
