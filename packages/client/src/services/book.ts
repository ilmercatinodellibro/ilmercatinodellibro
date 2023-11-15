import { Ref } from "vue";
import {
  useGetBooksQuery,
  useLoadBooksIntoDatabaseMutation,
} from "src/services/book.graphql";

export function useBookService(
  page: Ref<number>,
  rows: Ref<number>,
  filter: Ref<string | undefined>,
) {
  const {
    books,
    loading,
    refetch: refetchBooks,
  } = useGetBooksQuery(() => ({
    page: page.value,
    rows: rows.value,
    filter: filter.value,
  }));

  const loadBooksMutation = useLoadBooksIntoDatabaseMutation();

  return {
    books,
    loading,
    loadBooksMutation,
    refetchBooks,
  };
}
