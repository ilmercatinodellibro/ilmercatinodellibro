import { BookCopyQueryFilter } from "src/@generated/graphql";
import { BookCopyStatus } from "src/helpers/book-copy";

export default {
  sortByCopyCode: "Sort by book copy code",
  sortByISBN: "Sort by ISBN",
  checkOtherWarehouse: "Check the warehouse of {0}",
  filters: {
    isAvailable: "Available",
    isSold: "Sold",
    hasProblem: "With Problem",
  } satisfies Record<Exclude<keyof BookCopyQueryFilter, "search">, string>,
  owner: "Owner",
  bookCopyStatus: {
    LOST: "Lost",
    returned: "Returned",
    donated: "Donated to the Mercatino",
    INCOMPLETE: "Incomplete",
    "not-available": "Not Available",
    available: "Available",
    sold: "Sold",
  } satisfies Record<BookCopyStatus, string>,
};
