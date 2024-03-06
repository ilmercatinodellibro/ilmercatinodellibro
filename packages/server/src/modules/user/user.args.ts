import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/@generated";
import { Role } from "src/@generated/prisma";

@ArgsType()
export class UsersQueryArgs {
  @Field(() => Int)
  page!: number;

  @Field(() => Int, { defaultValue: 100 })
  rowsPerPage!: number;

  @Field(() => [Role], { defaultValue: [] })
  roles!: Role[];
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
export class UpdateRolePayload {
  @Field()
  id!: string;
  @Field(() => Role)
  role!: Role;
}
