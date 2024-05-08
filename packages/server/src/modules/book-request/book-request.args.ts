import { ArgsType, Field } from "@nestjs/graphql";
import { LocationBoundQueryArgs } from "src/modules/retail-location";

@ArgsType()
export class BookRequestQueryArgs extends LocationBoundQueryArgs {
  @Field(() => String)
  userId!: string;
}
