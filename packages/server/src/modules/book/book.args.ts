import {
  ArgsType,
  Field,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
} from "@nestjs/graphql";
import { Book, BookCreateWithoutRetailLocationInput } from "src/@generated";
import {
  LocationBoundInput,
  LocationBoundQueryArgs,
} from "src/modules/retail-location";

@InputType()
export class BookQueryFilter {
  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => Boolean, { nullable: true })
  isAvailable?: boolean;
}

@ArgsType()
export class BookQueryArgs extends LocationBoundQueryArgs {
  @Field(() => Int)
  page!: number;

  @Field(() => Int, { nullable: true })
  rows?: number;

  @Field(() => BookQueryFilter, { nullable: true })
  filter?: BookQueryFilter;
}

@ObjectType()
export class BookQueryResult {
  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  rowsCount!: number;

  @Field(() => [Book])
  rows!: Book[];
}

@InputType()
export class BookCreateInput extends IntersectionType(
  BookCreateWithoutRetailLocationInput,
  LocationBoundInput,
) {}
