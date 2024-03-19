import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";
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
export class RemoveUserPayload {
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
