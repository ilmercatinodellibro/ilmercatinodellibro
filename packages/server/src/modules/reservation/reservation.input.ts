import { Field, InputType } from "@nestjs/graphql";
import { LocationBoundInput } from "src/modules/retail-location";

@InputType()
export class CreateReservationInput extends LocationBoundInput {
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
