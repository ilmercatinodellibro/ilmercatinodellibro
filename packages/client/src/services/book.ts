import { useApolloClient } from "@vue/apollo-composable";
import { ComputedRef, Ref, computed } from "vue";
import { BookQueryFilter } from "src/@generated/graphql";
import {
  GetBookByIsbnDocument,
  GetBooksQueryVariables,
  useGetBooksQuery,
} from "src/services/book.graphql";
import { useRetailLocationService } from "src/services/retail-location";

export function useBookService(
  page: Ref<number>,
  rows: Ref<number>,
  filter?: ComputedRef<BookQueryFilter>,
) {
  const { selectedLocation } = useRetailLocationService();

  const {
    books: booksData,
    loading,
    refetch,
  } = useGetBooksQuery(() => ({
    page: page.value,
    rows: rows.value,
    filter: filter?.value,
    retailLocationId: selectedLocation.value.id,
  }));

  const books = computed(() => booksData.value?.rows ?? []);
  const booksPaginationDetails = computed(() => {
    const currentData = booksData.value;

    return {
      page: currentData?.page ?? 0,
      rowCount: currentData?.rowsCount ?? 0,
    };
  });

  async function refetchBooks(
    variables?: Omit<GetBooksQueryVariables, "retailLocationId">,
  ) {
    if (!variables) {
      return await refetch();
    }

    return await refetch({
      ...variables,
      retailLocationId: selectedLocation.value.id,
    });
  }

  return {
    books,
    booksPaginationDetails,
    loading,
    refetchBooks,
  };
}

export async function fetchBookByISBN(isbnCode: string) {
  const { selectedLocation } = useRetailLocationService();

  const { resolveClient } = useApolloClient();
  const client = resolveClient();

  const result = await client.query({
    query: GetBookByIsbnDocument,
    variables: {
      isbnCode,
      retailLocationId: selectedLocation.value.id,
    },
  });

  return result.data.books.rows[0];
}
