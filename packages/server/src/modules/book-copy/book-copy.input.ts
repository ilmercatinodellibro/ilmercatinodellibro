import { Field, InputType } from "@nestjs/graphql";
import { LocationBoundInput } from "src/modules/retail-location";

@InputType()
export class BookCopyCreateInput extends LocationBoundInput {
  @Field(() => [String], { nullable: false })
  bookIds!: string[];

  @Field(() => String, { nullable: false })
  ownerId!: string;
}

@InputType()
export class RefundBookCopyInput extends LocationBoundInput {
  @Field(() => String)
  bookCopyId!: string;
}

@InputType()
export class ReturnBookCopyInput extends LocationBoundInput {
  @Field(() => String)
  bookCopyId!: string;
}

@InputType()
export class ReimburseBookCopyInput extends LocationBoundInput {
  @Field(() => String)
  bookCopyId!: string;
}
