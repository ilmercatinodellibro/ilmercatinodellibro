import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/@generated/graphql/index.js";

@ObjectType()
export class AuthPayload {
  @Field()
  jwt!: string;

  @Field(() => User)
  user!: User;
}
