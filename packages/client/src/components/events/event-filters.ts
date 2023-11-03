import { syncRef } from "@vueuse/core";
import { ref } from "vue";
import { useHeaderSearch } from "src/composables/header-features/use-header-search";
import { EventFragment } from "src/services/event.graphql";

export function useEventFilters() {
  const textFilter = ref("");
  try {
    const { searchText } = useHeaderSearch();
    syncRef(textFilter, searchText);
  } catch {
    // do nothing
  }

  return {
    textFilter,
    applyTextFilter,
  };
}

const applyTextFilter = (row: EventFragment, filter: string) => {
  if (filter.length === 0) {
    return true;
  }

  const searchableFields = [row.name, row.description];

  return searchableFields.some((field) =>
    field.toLowerCase().includes(filter.toLowerCase()),
  );
};
