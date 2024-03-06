import { computed } from "vue";
import {
  GetCustomersDocument,
  GetCustomersQueryVariables,
  useGetCustomersLazyQuery,
} from "src/services/user.graphql";

export function useCustomerService() {
  // TODO: Make this dynamic
  const retailLocationId = "re";

  // TODO: Add convenient wrappers for lazy queries in @dreamonkey/graphql-codegen-vue-apollo-plugin
  const {
    result,
    loading,
    load: loadUsers,
    refetch: refetchUsers,
  } = useGetCustomersLazyQuery(() => ({
    // used to satisfy the type, actual parameters are set in fetch()
    page: 0,
    rowsPerPage: 0,
    retailLocationId,
  }));

  const customers = computed(() => result.value?.users.rows ?? []);
  const rowsCount = computed(() => result.value?.users.rowsCount ?? 0);

  async function fetch(
    variables: Omit<GetCustomersQueryVariables, "retailLocationId">,
  ) {
    const wrappedVariables: GetCustomersQueryVariables = {
      ...variables,
      page: variables.page - 1,
      retailLocationId,
    };

    const shouldLoad = loadUsers(GetCustomersDocument, wrappedVariables);
    if (shouldLoad !== false) {
      await shouldLoad;
      return;
    }

    await refetchUsers(wrappedVariables);
  }

  return {
    customers,
    rowsCount,
    loading,
    fetch,
  };
}
