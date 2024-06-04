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
import {
  LocationBoundInput,
  LocationBoundQueryArgs,
} from "src/modules/retail-location";

@InputType()
export class UserQueryFilters {
  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => Boolean, { nullable: true })
  withAvailable?: boolean;

  @Field(() => Boolean, { nullable: true })
  withRequested?: boolean;

  @Field(() => Boolean, { nullable: true })
  withPurchased?: boolean;

  @Field(() => Boolean, { nullable: true })
  withSold?: boolean;
}

@ArgsType()
export class UsersQueryArgs {
  @Field(() => Int)
  page!: number;

  @Field(() => Int, { defaultValue: 100 })
  rowsPerPage!: number;

  @Field(() => UserQueryFilters, { nullable: true })
  filter?: UserQueryFilters;
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
export class MembersQueryFilter {
  @Field(() => String, { defaultValue: "" })
  search?: string;

  @Field(() => Boolean, { nullable: true })
  [Role.ADMIN]?: boolean;

  @Field(() => Boolean, { nullable: true })
  [Role.OPERATOR]?: boolean;
}

@ArgsType()
export class MembersQueryArgs extends LocationBoundQueryArgs {
  @Field(() => MembersQueryFilter, { nullable: true })
  filters?: MembersQueryFilter;
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
    [
      "email",
      "firstname",
      "lastname",
      "notes",
      "phoneNumber",
      "delegate",
      "locale",
    ],
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

  @Field()
  dateOfBirth!: Date;
}

@InputType()
export class UpdateUserPayload extends IntersectionType(
  PickType(
    PartialType(User),
    [
      "firstname",
      "lastname",
      "email",
      "phoneNumber",
      "notes",
      "delegate",
      "dateOfBirth",
      "discount",
      "locale",
    ],
    InputType,
  ),
  LocationBoundInput,
) {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  passwordConfirmation?: string;
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
