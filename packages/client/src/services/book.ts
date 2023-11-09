import { Ref } from "vue";
import { useGetBooksQuery } from "src/services/book.graphql";

export function useBookService(page: Ref<number>, rows: Ref<number>) {
  const { books, loading } = useGetBooksQuery(() => ({
    input: { page: page.value, rows: rows.value },
  }));

  return {
    books,
    loading,
  };
}
