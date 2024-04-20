import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";

export function hasProblem({ problems }: BookCopyDetailsFragment) {
  const hasActiveProblem = problems?.some(({ resolvedAt }) => !resolvedAt);
  return hasActiveProblem;
}
