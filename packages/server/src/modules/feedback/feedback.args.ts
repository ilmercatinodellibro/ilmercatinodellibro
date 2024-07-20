import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class FeedbackRequestPayload {
  @Field()
  firstname!: string;

  @Field()
  lastname!: string;

  @Field()
  email!: string;

  @Field()
  message!: string;

  @Field()
  locale!: string;
}
