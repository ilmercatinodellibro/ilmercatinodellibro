import { ProblemType } from "src/@generated/graphql";
import { formatPrice } from "src/composables/use-misc-formats";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { selectedLocation } = useRetailLocationService();

export const hasProblem = ({ problems }: BookCopyDetailsFragment) =>
  problems?.some(({ resolvedAt }) => !resolvedAt);

export const getCurrentActiveProblem = ({
  problems,
}: BookCopyDetailsFragment) => problems?.find(({ resolvedAt }) => !resolvedAt);

export const isAvailable = (bookCopy: BookCopyDetailsFragment) =>
  (["donated", "reimbursed", "available"] as BookCopyStatus[]).includes(
    getStatus(bookCopy),
  );

export type BookCopyStatus =
  | "not-available"
  | "available"
  | "donated"
  | "returned"
  | "sold"
  | "reimbursed"
  | Exclude<ProblemType, "CUSTOM">;

export function getStatus(bookCopy: BookCopyDetailsFragment): BookCopyStatus {
  const problemType = getCurrentActiveProblem(bookCopy)?.type;

  return bookCopy.returnedAt
    ? "returned"
    : problemType
      ? problemType !== "CUSTOM"
        ? problemType
        : "not-available"
      : bookCopy.purchasedAt &&
          (!bookCopy.returnedAt ||
            bookCopy.sales?.some(({ refundedAt }) => !refundedAt))
        ? "sold"
        : bookCopy.donatedAt
          ? "donated"
          : bookCopy.reimbursedAt
            ? "reimbursed"
            : "available";
}

export const discountedPrice = (originalPrice: number, kind: "sell" | "buy") =>
  formatPrice(
    (originalPrice *
      (kind === "buy"
        ? selectedLocation.value.buyRate
        : selectedLocation.value.sellRate)) /
      100,
  );
