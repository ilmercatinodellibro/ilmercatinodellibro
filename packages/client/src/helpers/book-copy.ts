import { ProblemType } from "src/@generated/graphql";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";

export const hasProblem = ({ problems }: BookCopyDetailsFragment) =>
  problems?.some(({ resolvedAt }) => !resolvedAt);

export const getCurrentActiveProblem = ({
  problems,
}: BookCopyDetailsFragment) => problems?.find(({ resolvedAt }) => !resolvedAt);

export const isAvailable = (bookCopy: BookCopyDetailsFragment) => {
  const status = getStatus(bookCopy);
  return status === "available" || status === "donated";
};

export type BookCopyStatus =
  | "not-available"
  | "available"
  | "donated"
  | "returned"
  | "sold"
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
          : "available";
}
