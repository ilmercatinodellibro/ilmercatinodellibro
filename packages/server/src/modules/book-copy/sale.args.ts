import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class SaleRefundInput {
  @Field(() => String, { nullable: false })
  saleId!: string;
}
