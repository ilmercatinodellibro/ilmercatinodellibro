import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";

export const hasProblem = ({ problems }: BookCopyDetailsFragment) =>
  problems?.some(({ resolvedAt }) => !resolvedAt);

export const getCurrentActiveProblem = ({
  problems,
}: BookCopyDetailsFragment) => problems?.find(({ resolvedAt }) => !resolvedAt);

export const isAvailable = (bookCopy: BookCopyDetailsFragment) =>
  !hasProblem(bookCopy) && !bookCopy.purchasedAt && !bookCopy.returnedAt;
