import { computed, reactive } from "vue";
import {
  FilterPath,
  useTranslatedFilters,
} from "src/composables/use-filter-translations";
import { TableFilters } from "src/models/book";

export function useTableFilters(filterPath: FilterPath) {
  const filterOptions = useTranslatedFilters(filterPath);

  const tableFilter = reactive<TableFilters>({
    searchQuery: "",
    filters: [],
    schoolFilters: {
      selectedSchoolCourseIds: [],
      selectedSchoolCodes: [],
    },
  });

  function updateFilters({
    filters,
    schoolFilters,
    searchQuery,
  }: TableFilters) {
    tableFilter.filters = filters;
    tableFilter.schoolFilters = schoolFilters;
    tableFilter.searchQuery = searchQuery;
  }

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

  return {
    refetchFilterProxy,
    filterOptions,
    tableFilter,
    updateFilters,
  };
}
