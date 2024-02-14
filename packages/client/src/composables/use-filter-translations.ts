import { ResourcePath, ResourceValue } from "@intlify/core-base";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { MessageSchema } from "src/boot/i18n";

type AllKeys = ResourcePath<MessageSchema>;
type ArrayValueKeys = {
  [K in AllKeys]: string[] extends ResourceValue<MessageSchema, K> ? K : never;
}[AllKeys];

export function useTranslatedFilters<TResultKey>(key: ArrayValueKeys) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { tm, rt } = useI18n();

  return computed(() =>
    tm(key).map((filter, key) => ({
      key: key as TResultKey,
      label: rt(filter),
    })),
  );
}
