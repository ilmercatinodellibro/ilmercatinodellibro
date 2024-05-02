import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";

export function hasProblem({ problems }: BookCopyDetailsFragment) {
  return problems?.some(({ resolvedAt }) => !resolvedAt);
}

export function getCurrentActiveProblem({ problems }: BookCopyDetailsFragment) {
  return problems?.find(({ resolvedAt }) => !resolvedAt);
}

export function isAvailable(bookCopy: BookCopyDetailsFragment): boolean {
  return !hasProblem(bookCopy) && !bookCopy.purchasedAt && !bookCopy.returnedAt;
}
