import {
  useCreateBookCopiesMutation,
  useGetBookCopiesByOwnerQuery,
  useGetBookCopiesQuery,
  useGetPurchasedBookCopiesQuery,
  useReportProblemMutation,
  useResolveProblemMutation,
} from "src/services/book-copy.graphql";

export function useBookCopyService() {
  const createBookCopiesComposable = useCreateBookCopiesMutation();
  const createReportProblemComposable = useReportProblemMutation();
  const createResolveProblemComposable = useResolveProblemMutation();

  return {
    useGetBookCopiesByOwnerQuery,
    useGetBookCopiesQuery,
    useGetPurchasedBookCopiesQuery,
    createBookCopiesComposable,
    createReportProblemComposable,
    createResolveProblemComposable,
  };
}
