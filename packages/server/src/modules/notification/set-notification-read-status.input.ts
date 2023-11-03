import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class SetNotificationReadStatusInput {
  @Field()
  id!: string;

  @Field()
  read!: boolean;
}
