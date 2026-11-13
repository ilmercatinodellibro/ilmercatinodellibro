import { ArgsType, Field } from "@nestjs/graphql";
import { LocationBoundQueryArgs } from "src/modules/retail-location/index.js";

@ArgsType()
export class UserReservationsQueryArgs extends LocationBoundQueryArgs {
  @Field(() => String)
  userId!: string;
}
