import { BookCopyQueryFilter } from "src/@generated/graphql";
import { BookCopyStatus } from "src/helpers/book-copy";

export default {
  searchPlaceholder: "Write at least 3 characters to search",
  sortByCopyCode: "Sort by book copy code",
  sortByISBN: "Sort by ISBN",
  checkOtherWarehouse: "Check the warehouse of {0}",
  availabilityTooltip: [
    "Total: {copiesCount}",
    "With problems: {problemsCount}",
    "Sold: {soldCount}",
    "Reserved: {reservationsCount}",
    "In cart: {cartItemsCount}",
    "Donated: {donatedCount}",
  ].join("\n"),
  filters: {
    isAvailable: "Available",
    isSold: "Sold",
    hasProblems: "With Problem",
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
    inStock: "In Stock",
    reimbursed: "Reimbursed",
  } satisfies Record<BookCopyStatus | "inStock", string>,
};
