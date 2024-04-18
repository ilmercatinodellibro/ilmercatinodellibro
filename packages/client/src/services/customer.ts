import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRetailLocationService } from "src/services/retail-location";
import {
  GetCustomersQueryVariables,
  useGetCustomersLazyQuery,
} from "src/services/user.graphql";

export function useCustomerService() {
  const { selectedLocation } = useRetailLocationService();
  const { t } = useI18n();

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
      retailLocationId: selectedLocation.value?.id ?? "",
    }),
    // Also when using load, you must not disable the query otherwise it will likely not be run because the condition is not updated.
  );

  const customers = computed(() => result.value?.users.rows ?? []);
  const rowsCount = computed(() => result.value?.users.rowsCount ?? 0);

  async function fetch(
    variables: Omit<GetCustomersQueryVariables, "retailLocationId">,
  ) {
    if (!selectedLocation.value?.id) {
      throw new Error(t("retailLocation.errors.noLocation"));
    }

    const queryVariables: GetCustomersQueryVariables = {
      ...variables,
      page: variables.page - 1,
      retailLocationId: selectedLocation.value.id,
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
