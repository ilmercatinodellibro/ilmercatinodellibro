import { ArgsType, Field, InputType } from "@nestjs/graphql";

@ArgsType()
export class RetailLocationQueryArgs {
  @Field()
  id!: string;
}

@ArgsType()
export class LocationBoundQueryArgs {
  @Field()
  retailLocationId!: string;
}

@InputType({ isAbstract: true })
export class LocationBoundInput {
  @Field()
  retailLocationId!: string;
}
