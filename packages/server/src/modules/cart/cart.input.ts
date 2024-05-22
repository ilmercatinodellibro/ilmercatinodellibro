import { Field, InputType } from "@nestjs/graphql";
import { LocationBoundInput } from "src/modules/retail-location";

@InputType()
export class OpenCartInput extends LocationBoundInput {
  @Field()
  userId!: string;
}

@InputType()
export class AddToCartInput {
  @Field()
  cartId!: string;

  @Field(() => String, { nullable: true })
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

@InputType()
export class FinalizeCartInput {
  @Field()
  cartId!: string;

  @Field(() => [String])
  bookCopyIds!: string[];
}

@InputType()
export class DeleteCartInput {
  @Field()
  cartId!: string;
}
