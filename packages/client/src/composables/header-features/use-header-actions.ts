import { ref, watch, type Ref } from "vue";
import { useRoute } from "vue-router";
import { injectorFactory } from "src/helpers/injector-factory";
import type { QBtnProps } from "quasar";

const { provider: _provideHeaderActions, injector: injectHeaderActions } =
  injectorFactory<Ref<QBtnProps[]>>("header-actions");

export function provideHeaderActions() {
  const headerActions = ref<QBtnProps[]>([]);

  _provideHeaderActions(headerActions);

  const route = useRoute();

  watch(
    () => route.name,
    () => {
      headerActions.value = [];
    },
  );

  return { headerActions };
}

export function useHeaderActions() {
  const headerActions = injectHeaderActions();

  return { headerActions };
}
