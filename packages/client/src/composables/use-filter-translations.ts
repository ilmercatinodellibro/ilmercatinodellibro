import { computed } from "vue";
import { MessageFunction, VueMessageType, useI18n } from "vue-i18n";

export function useTranslatedFilters<T>(key: string) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { tm, rt } = useI18n();
  return computed(() =>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    (tm(key) as VueMessageType[] | MessageFunction<VueMessageType>[]).map(
      (filter, key) => ({ key: key as T, label: rt(filter) }),
    ),
  );
}
