import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class UserReservationsQueryArgs {
  @Field(() => String)
  userId!: string;
}
