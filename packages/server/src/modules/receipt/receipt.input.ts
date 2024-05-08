import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ResendReceiptInput {
  @Field()
  receiptId!: string;
}
