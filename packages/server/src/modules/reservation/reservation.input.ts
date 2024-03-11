import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateReservationInput {
  @Field()
  userId!: string;

  @Field(() => [String])
  bookIds!: string[];
}

// We are overriding the id field to be required as it's mandatory for the update mutation
@InputType()
export class DeleteReservationInput {
  @Field()
  id!: string;
}
