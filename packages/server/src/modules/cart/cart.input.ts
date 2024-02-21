import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class OpenCartInput {
  @Field()
  userId!: string;
}

@InputType()
export class AddToCartInput {
  @Field()
  cartId!: string;

  @Field()
  bookIsbn!: string;
}
