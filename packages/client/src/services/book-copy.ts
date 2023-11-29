import {
  useCreateBookCopiesMutation,
  useGetBookCopiesByOwnerQuery,
  useGetBookCopiesQuery,
} from "src/services/book-copy.graphql";

export function useBookCopyService() {
  const createBookCopiesComposable = useCreateBookCopiesMutation();

  return {
    useGetBookCopiesByOwnerQuery,
    useGetBookCopiesQuery,
    createBookCopiesComposable,
  };
}
