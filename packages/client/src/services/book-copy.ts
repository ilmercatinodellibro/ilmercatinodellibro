import {
  useCreateBookCopiesMutation,
  useGetBookCopiesByOwnerQuery,
  useGetBookCopiesQuery,
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
    createBookCopiesComposable,
    createReportProblemComposable,
    createResolveProblemComposable,
  };
}
