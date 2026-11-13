import type { QTableProps } from "quasar";
import { computed, reactive } from "vue";
import {
  type FilterPath,
  useTranslatedFilters,
} from "@/composables/use-filter-translations";
import type { TableFilters } from "@/models/book";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const filterMethod: QTableProps["filterMethod"] = (rows) => rows;

export function useTableFilters(
  filterPath: FilterPath,
  useSchoolFilters = false,
) {
  const filterOptions = useTranslatedFilters(filterPath);

  const tableFilter = reactive<TableFilters>({
    searchQuery: "",
    filters: [],
    schoolFilters: useSchoolFilters
      ? {
          selectedSchoolCourseIds: [],
          selectedSchoolCodes: [],
        }
      : undefined,
  });

  const booleanFilters = computed(() => {
    const areFiltersEmpty = tableFilter.filters.length === 0;
    if (areFiltersEmpty) {
      return;
    }

    const extractedFiltersFromOptions: Record<string, boolean> = {};
    for (const key of Object.keys(filterOptions.value)) {
      extractedFiltersFromOptions[key] = tableFilter.filters.includes(key);
    }

    return extractedFiltersFromOptions;
  });

  const refetchFilterProxy = computed(() => {
    const selectedSchoolCodes =
      tableFilter.schoolFilters?.selectedSchoolCodes ?? [];
    const selectedSchoolCourseIds =
      tableFilter.schoolFilters?.selectedSchoolCourseIds ?? [];

    const schoolFilters = {
      schoolCodes:
        selectedSchoolCodes.length > 0 ? selectedSchoolCodes : undefined,
      schoolCourseIds:
        selectedSchoolCourseIds.length > 0
          ? selectedSchoolCourseIds
          : undefined,
    };

    return {
      search: tableFilter.searchQuery,
      ...booleanFilters.value,
      ...schoolFilters,
    };
  });

  return {
    refetchFilterProxy,
    filterOptions,
    tableFilter,
    /**
     * This filter isn't actually used, but by passing any filters to the QTable it allows
     * the component to throw the "@request" event which is used to refetch our data
     */
    filterMethod,
    booleanFilters,
  };
}
