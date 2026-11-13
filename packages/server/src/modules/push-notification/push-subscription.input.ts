import { InputType, PickType } from "@nestjs/graphql";
import { PushSubscription } from "src/@generated/graphql";

@InputType()
export class PushSubscriptionInput extends PickType(
  PushSubscription,
  ["deviceToken"],
  InputType,
) {}
