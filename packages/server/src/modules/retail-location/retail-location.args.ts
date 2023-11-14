import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class RetailLocationQueryPayload {
  @Field()
  id?: string;
}
