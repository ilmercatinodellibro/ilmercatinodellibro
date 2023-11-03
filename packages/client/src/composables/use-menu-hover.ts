import { debounce } from "quasar";
import { ref, watch } from "vue";

export interface UseMenuHoverOptions {
  /**
   * @default 50
   */
  debounce?: number;
}

/**
 * @see https://github.com/quasarframework/quasar/issues/5787#issuecomment-1014585492 for the source of inspiration
 */
export function useMenuHover({
  debounce: debounceTime = 50,
}: UseMenuHoverOptions = {}) {
  const activatorHover = ref(false);
  const menuHover = ref(false);
  const menuModel = ref(false);

  function assignModel() {
    menuModel.value = activatorHover.value || menuHover.value;
  }
  const debouncedAssignModel = debounce(assignModel, debounceTime);

  watch([menuHover, activatorHover], () => {
    debouncedAssignModel();
  });

  const activatorProps = {
    onMouseenter: () => (activatorHover.value = true),
    onMouseleave: () => (activatorHover.value = false),
  };
  const menuProps = ref({
    modelValue: menuModel,
    onMouseenter: () => (menuHover.value = true),
    onMouseleave: () => (menuHover.value = false),
  });

  return {
    menuModel,
    activatorProps,
    menuProps,
  };
}
