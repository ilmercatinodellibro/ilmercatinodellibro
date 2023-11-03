import { Field, InputType } from "@nestjs/graphql";
import { Role } from "src/@generated/prisma";

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
