import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class BookRequestQueryArgs {
  @Field(() => String)
  userId!: string;
}
