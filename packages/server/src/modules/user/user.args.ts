import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
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

export enum SettleRemainingType {
  RETURN = "RETURN",
  REFUND = "REFUND",
}
registerEnumType(SettleRemainingType);

@InputType()
export class SettleUserInput extends LocationBoundInput {
  @Field()
  userId!: string;

  @Field(() => SettleRemainingType)
  remainingType!: SettleRemainingType;
}
