import {
  useCreateBookCopiesMutation,
  useGetBookCopiesByOwnerQuery,
  useGetBookCopiesQuery,
  useGetPurchasedBookCopiesQuery,
  useGetReturnedBookCopiesQuery,
  useGetSoldBookCopiesQuery,
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
    useGetReturnedBookCopiesQuery,
    useGetSoldBookCopiesQuery,
    createBookCopiesComposable,
    createReportProblemComposable,
    createResolveProblemComposable,
  };
}
