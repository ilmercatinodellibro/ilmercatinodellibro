import { computed } from "vue";
import { useI18n } from "vue-i18n";

enum filterValues {
  Available,
  Sold,
  Booked,
  HighUtility,
  MediumUtility,
  LowUtility,
}

export function useFilters() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { tm, rt } = useI18n();
  return computed(() => {
    return tm("book.filters.options")
      .map((filter) => rt(filter))
      .map((filter, index) => {
        return { key: index as filterValues, label: filter };
      });
  });
}
