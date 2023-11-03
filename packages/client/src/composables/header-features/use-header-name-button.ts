import { Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { injectorFactory } from "src/helpers/injector-factory";

type HeaderName = Ref<string | undefined>;

export const { provider: _provideHeaderName, injector: injectHeaderName } =
  injectorFactory<HeaderName>("header-name-button");

export function provideHeaderName() {
  const { t } = useI18n();

  /** If undefined disables the feature. */
  const headerName = ref<string>();

  _provideHeaderName(headerName);

  const route = useRoute();

  // Resets the status each time we change the route
  watch(
    () => route.name,
    (currentRouteName) => {
      headerName.value =
        currentRouteName !== null && currentRouteName !== undefined
          ? t(`routesNames.${currentRouteName.toString()}`)
          : undefined;
    },
    { immediate: true },
  );
  return { headerName };
}
