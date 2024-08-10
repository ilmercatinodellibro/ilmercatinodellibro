import { useApolloClient } from "@vue/apollo-composable";
import {
  GetPaginatedBookCopiesDocument,
  GetPaginatedBookCopiesQueryVariables,
} from "src/services/book-copy.graphql";
import { useRetailLocationService } from "src/services/retail-location";

export async function fetchBooksCopies(
  options: Omit<GetPaginatedBookCopiesQueryVariables, "retailLocationId">,
) {
  const { selectedLocation } = useRetailLocationService();

  const { resolveClient } = useApolloClient();
  const client = resolveClient();

  const result = await client.query({
    query: GetPaginatedBookCopiesDocument,
    variables: {
      retailLocationId: selectedLocation.value.id,
      ...options,
    },
    // Books availability changes frequently, we always need the latest data when fetching books
    fetchPolicy: "network-only",
  });

  return result.data.paginatedBookCopies;
}
