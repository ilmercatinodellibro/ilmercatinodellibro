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

  @Field({ nullable: true })
  fromBookIsbn?: string;

  @Field({ nullable: true })
  fromReservationId?: string;

  @Field({ nullable: true })
  fromBookRequestId?: string;
}

@InputType()
export class RemoveFromCartInput {
  @Field()
  cartId!: string;

  @Field()
  bookId!: string;
}
