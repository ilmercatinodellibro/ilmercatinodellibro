import { Field, InputType, registerEnumType } from "@nestjs/graphql";

export enum FeedbackType {
  FEATURE_IMPROVEMENT = "Feature Request",
  NEW_FEATURE = "New Feature",
  BUG = "Bug",
  OTHER = "Other",
}

registerEnumType(FeedbackType, {
  name: "FeedbackType",
  description: undefined,
});

@InputType()
export class FeedbackRequestPayload {
  @Field(() => FeedbackType)
  type!: FeedbackType;
  @Field()
  message!: string;
}
