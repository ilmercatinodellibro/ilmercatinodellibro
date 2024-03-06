import { computed, ref } from "vue";
import {
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
    refetch,
  } = useGetCustomersLazyQuery(
    // When using the function form, `load` does not respect the variables passed to it, so we use a `ref` instead
    // see: https://github.com/vuejs/apollo/issues/1540
    // used to satisfy the type, actual parameters are set in fetch()
    ref({
      page: 1,
      rowsPerPage: 0,
      retailLocationId,
    }),
  );

  const customers = computed(() => result.value?.users.rows ?? []);
  const rowsCount = computed(() => result.value?.users.rowsCount ?? 0);

  async function fetch(
    variables: Omit<GetCustomersQueryVariables, "retailLocationId">,
  ) {
    const queryVariables: GetCustomersQueryVariables = {
      ...variables,
      page: variables.page - 1,
      retailLocationId,
    };

    const shouldLoad = loadUsers(undefined, queryVariables);
    if (shouldLoad !== false) {
      await shouldLoad;
      return;
    }

    await refetch(queryVariables);
  }

  return {
    customers,
    rowsCount,
    loading,
    fetch,
  };
}
