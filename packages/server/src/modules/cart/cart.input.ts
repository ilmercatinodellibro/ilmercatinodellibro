import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class OpenCartInput {
  @Field()
  userId!: string;
}
