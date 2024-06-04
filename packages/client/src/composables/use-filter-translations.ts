import { computed } from "vue";
import { useI18n } from "vue-i18n";

export type FilterPath =
  | "warehouse.filters"
  | "book.filters.options"
  | "manageUsers.filters"
  | "general.rolesAndPermissions.filters";

export function useTranslatedFilters(key: FilterPath) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { tm, rt } = useI18n();
  return computed(() => {
    const returnObject: Record<string, string> = {};
    Object.entries(tm(key)).forEach(([key, value]) => {
      returnObject[key] = rt(value);
    });
    return returnObject;
  });
}
