import { InputType, PickType } from "@nestjs/graphql";
import { PushSubscription } from "src/@generated/graphql/index.js";

@InputType()
export class PushSubscriptionInput extends PickType(
  PushSubscription,
  ["deviceToken"],
  InputType,
) {}
