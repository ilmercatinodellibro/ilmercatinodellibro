import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BookUtility {
  @Field()
  value!: number;

  @Field()
  booksTaken!: number;

  @Field()
  booksInWarehouse!: number;

  @Field()
  booksSold!: number;

  @Field()
  requestsActive!: number;

  @Field()
  requestsTotal!: number;
}
