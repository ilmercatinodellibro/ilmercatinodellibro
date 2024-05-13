import { QTableProps } from "quasar";
import { computed, reactive } from "vue";
import {
  FilterPath,
  useTranslatedFilters,
} from "src/composables/use-filter-translations";
import { TableFilters } from "src/models/book";

export function useTableFilters(
  filterPath: FilterPath,
  useSchoolFilters?: boolean,
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

  function getBooleanFiltersFromOptions() {
    // Only considers the checkbox options, required to send undefined in and ignore the filter when not required
    const areFiltersEmpty = tableFilter.filters.length === 0;

    if (areFiltersEmpty) {
      return undefined;
    }

    const booleanFiltersToReturn: Record<string, boolean> = {};

    Object.keys(filterOptions.value).forEach((key) => {
      booleanFiltersToReturn[key] = tableFilter.filters.includes(key);
    });

    return booleanFiltersToReturn;
  }

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
      ...getBooleanFiltersFromOptions(),
      ...schoolFilters,
    };
  });

  // This filter isn't actually used BUT by passing our filters to the QTable it allows
  // the component to throw the "@request" event which is used to refetch our data
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const filterMethod: QTableProps["filterMethod"] = (rows) => rows;

  return {
    refetchFilterProxy,
    filterOptions,
    tableFilter,
    filterMethod,
  };
}
