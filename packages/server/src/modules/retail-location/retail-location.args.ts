import { ArgsType, Field, InputType, ObjectType } from "@nestjs/graphql";

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

@ObjectType()
export class StatisticsQueryResult {
  // The number of all book copies that were sold and not returned back to the retailLocationId.
  @Field(() => Number)
  totalSoldBooks!: number;

  // The number of book copies that have been left to the retailLocation and that were not sold.
  @Field(() => Number)
  totalPresentBooks!: number;

  // The total number of book copies that are currently reserved based on the number of the available copies
  // No need for a relation with the "bookCopy" since it's not important which one will be sold.
  // The important thing is that the number of reservations for that book are <= than the available copies
  @Field(() => Number)
  totalReservedBooks!: number;

  // TODO: not sure what CC here means, we only know that they have problems
  // The number of book copies with problems
  @Field(() => Number)
  totalBooksWithProblems!: number;

  // The number of book copies that were requested in general. A user can "request" a book even if no copies
  // are available at the time being. So there is no relation with a "bookCopy"
  @Field(() => Number)
  totalRequestedBooks!: number;

  // Total of collected money from sells. This must not consider refunded earns and money paid to users that sold books to the mercatino
  @Field(() => Number)
  totalRevenue!: number;

  // Money that the mercatino returned to the users that had initially sold the books to the mercatino
  @Field(() => Number)
  settledTotal!: number;

  // Total users of that retailLocation that are not Admins or Operators
  @Field(() => Number)
  totalUsers!: number;

  // Total money that still needs to be settled
  @Field(() => Number)
  settleableTotal!: number;
}
