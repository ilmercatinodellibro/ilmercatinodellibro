import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
} from "@nestjs/graphql";

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

@InputType()
export class ResetRetailLocationInput extends LocationBoundInput {}

@ObjectType()
export class StatisticsQueryResult {
  // Count of all book copies in the system.
  @Field(() => Int)
  bookCopiesCount!: number;

  // Count of book copies currently in the warehouse.
  @Field(() => Int)
  booksInWarehouseCount!: number;

  // Count of book copies with problems and still in the warehouse.
  @Field(() => Int)
  booksWithProblemsCount!: number;

  // Count of book copies with problems, regardless of where they are now.
  @Field(() => Int)
  booksWithProblemsInWarehouseCount!: number;

  // Count of book copies currently in the warehouse that can be sold.
  @Field(() => Int)
  salableBooksCount!: number;

  // Count of book copies which as been returned to their owner.
  @Field(() => Int)
  returnedBooksCount!: number;

  // Count of book copies which as been donated to Mercatino by their owner.
  @Field(() => Int)
  donatedBooksCount!: number;

  // Count of book copies which as been reimbursed to their owner because they has been lost/damaged while in our custody.
  @Field(() => Int)
  reimbursedBooksCount!: number;

  // Count of all sales.
  @Field(() => Int)
  salesCount!: number;

  // Count of sales which has not been refunded.
  @Field(() => Int)
  activeSalesCount!: number;

  // Count of sales which has been refunded.
  @Field(() => Int)
  refundedSalesCount!: number;

  // Count of active reservations, which haven't led to a sale or expired yet.
  @Field(() => Int)
  activeReservationsCount!: number;

  // Count of active book requests, which haven't been deleted by the user.
  @Field(() => Int)
  activeRequestsCount!: number;

  // Count of users which requested or gave in books.
  @Field(() => Int)
  activeUsersCount!: number;

  // Money returned to the users for which Mercatino was able to sell their books.
  @Field(() => Float)
  settledAmount!: number;

  // Amount that still needs to be settled.
  @Field(() => Float)
  settleableAmount!: number;

  // Amount that had been spent on reimbursing books, e.g. because they were lost or damaged.
  @Field(() => Float)
  reimbursedAmount!: number;

  // Revenue generated from admin accounts, for which no settlement is needed.
  @Field(() => Float)
  adminAccountsRevenue!: number;

  // Gross revenue from sales, which doesn't take into account reimbursements and settlements.
  @Field(() => Float)
  grossRevenue!: number;

  // Net revenue from sales, which takes into account reimbursements and settlements.
  @Field(() => Float)
  netRevenue!: number;
}
