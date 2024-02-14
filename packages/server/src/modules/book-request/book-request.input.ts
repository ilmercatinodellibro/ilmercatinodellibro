import { InputType, PickType } from "@nestjs/graphql";
import { BookRequest } from "src/@generated";

@InputType()
export class CreateBookRequestInput extends PickType(
  BookRequest,
  ["userId", "bookId"],
  InputType,
) {}
