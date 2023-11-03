import { InputType, PickType } from "@nestjs/graphql";
import { PushSubscription } from "src/@generated";

@InputType()
export class PushSubscriptionInput extends PickType(
  PushSubscription,
  ["deviceToken"],
  InputType,
) {}
