import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class GetAccessTokenFromRefreshTokenInput {
  @Field()
  email!: string;

  @Field()
  refreshToken!: string;
}
