import { ArgsType, Field, InputType } from "@nestjs/graphql";

@ArgsType()
export class BookCopyQueryArgs {
  @Field(() => String)
  bookId?: string;
}

@ArgsType()
export class BookCopyByUserQueryArgs {
  @Field(() => String)
  userId!: string;
}

@InputType()
export class BookCopyCreateInput {
  @Field(() => [String], { nullable: false })
  bookIds!: string[];

  @Field(() => String, { nullable: false })
  ownerId!: string;
}
