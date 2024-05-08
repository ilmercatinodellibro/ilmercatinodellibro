import { ArgsType, Field } from "@nestjs/graphql";
import { LocationBoundQueryArgs } from "src/modules/retail-location";

@ArgsType()
export class GetReceiptsArgs extends LocationBoundQueryArgs {
  @Field()
  userId!: string;
}
