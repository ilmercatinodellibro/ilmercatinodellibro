import { Ref, computed } from "vue";
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
    books: booksData,
    loading,
    refetch: refetchBooks,
  } = useGetBooksQuery(() => ({
    page: page.value,
    rows: rows.value,
    filter: filter.value,
  }));

  const loadBooksMutation = useLoadBooksIntoDatabaseMutation();
  const books = computed(() => booksData.value?.rows ?? []);
  const booksPaginationDetails = computed(() => {
    const currentData = booksData.value;

    return {
      page: currentData?.page ?? 0,
      filter: currentData?.filter ?? "",
      rowCount: currentData?.rowsCount ?? 0,
    };
  });

  return {
    books,
    booksPaginationDetails,
    loading,
    loadBooksMutation,
    refetchBooks,
  };
}
