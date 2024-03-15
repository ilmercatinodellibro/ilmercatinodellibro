import { ArgsType, Field, InputType } from "@nestjs/graphql";
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
