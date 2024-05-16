import { ArgsType, Field, InputType } from "@nestjs/graphql";

@ArgsType()
export class GetUserDataArgs {
  @Field()
  userId!: string;
}

@InputType()
export class DeleteUserAccountInput {
  @Field()
  userId!: string;
}

@InputType()
export class CancelUserAccountDeletionInput {
  @Field()
  userId!: string;
}
