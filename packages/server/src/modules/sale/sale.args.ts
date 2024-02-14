import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class UserSalesQueryArgs {
  @Field(() => String)
  userId!: string;
}

@ArgsType()
export class UserPurchasesQueryArgs {
  @Field(() => String)
  userId!: string;
}
