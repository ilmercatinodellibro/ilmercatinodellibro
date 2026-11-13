import { ArgsType, Field } from "@nestjs/graphql";
import { LocationBoundQueryArgs } from "src/modules/retail-location/index.js";

@ArgsType()
export class UserSalesQueryArgs extends LocationBoundQueryArgs {
  @Field(() => String)
  userId!: string;
}

@ArgsType()
export class UserPurchasesQueryArgs extends LocationBoundQueryArgs {
  @Field(() => String)
  userId!: string;
}
