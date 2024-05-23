import {
  ArgsType,
  Field,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
  PartialType,
  PickType,
  registerEnumType,
} from "@nestjs/graphql";
import { User } from "src/@generated";
import { Role } from "src/@generated/prisma";
import { LocationBoundInput } from "src/modules/retail-location";

@ArgsType()
export class UsersQueryArgs {
  @Field(() => Int)
  page!: number;

  @Field(() => Int, { defaultValue: 100 })
  rowsPerPage!: number;

  @Field(() => String, { nullable: true })
  searchTerm?: string;

  // TODO: Add filters (with available, with requested, with purchased, with sold)
}

@ObjectType()
export class UsersQueryResult {
  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  rowsCount!: number;

  @Field(() => [User])
  rows!: User[];
}

@InputType()
export class RemoveMemberPayload extends LocationBoundInput {
  @Field()
  id!: string;
}

@InputType()
export class UpdateRolePayload extends LocationBoundInput {
  @Field()
  userId!: string;

  @Field(() => Role)
  role!: Role;
}

@InputType()
export class RegisterUserPayload extends IntersectionType(
  PickType(
    User,
    ["email", "firstname", "lastname", "notes", "phoneNumber"],
    InputType,
  ),
  LocationBoundInput,
) {
  @Field(() => Boolean, { nullable: true })
  discount?: boolean;

  @Field()
  password!: string;

  @Field()
  passwordConfirmation!: string;
}

@InputType()
export class UpdateUserPayload extends IntersectionType(
  PickType(
    PartialType(User),
    [
      "firstname",
      "lastname",
      "notes",
      "phoneNumber",
      "id",
      "delegate",
      "dateOfBirth",
      "locale",
    ],
    InputType,
  ),
  LocationBoundInput,
) {
  @Field(() => Boolean, { nullable: true })
  discount?: boolean;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  passwordConfirmation?: string;

  @Field(() => String, { nullable: true })
  email?: string;
}

export enum SettleRemainingType {
  RETURN = "RETURN",
  REFUND = "REFUND",
}
registerEnumType(SettleRemainingType, {
  name: "SettleRemainingType",
});

@InputType()
export class SettleUserInput extends LocationBoundInput {
  @Field()
  userId!: string;

  @Field(() => SettleRemainingType)
  remainingType!: SettleRemainingType;
}
