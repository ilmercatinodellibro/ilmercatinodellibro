import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";

export function hasProblem({ problems }: BookCopyDetailsFragment) {
  return problems?.some(({ resolvedAt }) => !resolvedAt);
}

export function getCurrentActiveProblem({ problems }: BookCopyDetailsFragment) {
  return problems?.find(({ resolvedAt }) => !resolvedAt);
}
