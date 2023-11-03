import { Field, InputType, OmitType } from "@nestjs/graphql";
import { EventUpdateInput as BaseEventUpdateInput } from "src/@generated";

// We are overriding the id field to be required as it's mandatory for the update mutation
@InputType()
export class EventUpdateInput extends OmitType(
  BaseEventUpdateInput,
  ["id"],
  InputType,
) {
  @Field()
  id!: string;
}
