import { Field, InputType, OmitType } from "@nestjs/graphql";
import { UserUpdateWithoutEventsInput as BaseUserUpdateInput } from "src/@generated";

// We are overriding the id field to be required as it's mandatory for the update mutation
@InputType()
export class UserUpdateInput extends OmitType(
  BaseUserUpdateInput,
  ["id"],
  InputType,
) {
  @Field()
  id!: string;
}
