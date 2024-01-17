import { Book } from "src/@generated/graphql";
export type BookSummary = Omit<
  Book,
  "_count" | "copies" | "retailLocation" | "retailLocationId"
>;
