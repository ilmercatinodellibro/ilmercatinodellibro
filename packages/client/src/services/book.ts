import { Ref } from "vue";
import {
  useGetBooksQuery,
  useLoadBooksIntoDatabaseMutation,
} from "src/services/book.graphql";

export function useBookService(page: Ref<number>, rows: Ref<number>) {
  const { books, loading } = useGetBooksQuery(() => ({
    input: { page: page.value, rows: rows.value },
  }));

  const loadBooksMutation = useLoadBooksIntoDatabaseMutation();

  return {
    books,
    loading,
    loadBooksMutation,
  };
}
