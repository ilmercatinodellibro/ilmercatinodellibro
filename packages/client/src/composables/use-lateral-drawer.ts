import { debounce, Screen } from "quasar";
import { computed, nextTick, ref, watch } from "vue";

export const DRAWER_WIDTH = 255;
// We do not want to use 1024 because otherwise ipad horizontal viewport would be considered as mobile mode
export const DRAWER_BREAKPOINT = 1023;

/**
 * Place this in a v-if.
 * Used to hide or reload the drawer when required
 */
const showLateralDrawer = ref(true);

/**
 * Place this in v-model.
 * Allows you to close/open the drawer
 */
const isDrawerOpen = ref(false);
/**
 * Place this in mini.
 * Allows you to trigger the mini mode (EG: Expands/collapses dialog in large viewport)
 */
const isDrawerMini = ref(false);

const isMobile = computed(() => Screen.width <= DRAWER_BREAKPOINT);

let lastCheckedScreenWidth = Screen.width;

// This watch is used to handle a specific use case when the lateral drawer is opened when in small viewport and changes viewport.
// It works by removing and re adding it through the v-if and allows the component to reload itself
// This problem is not that frequent so I don't think that it generates performance issues.
// My use case was rotating smartphone
watch(
  () => Screen.width,
  debounce((currentScreenWidth: number) => {
    // We can't use the previous value of the watch since the function is debounced
    const previousValue = lastCheckedScreenWidth;
    lastCheckedScreenWidth = currentScreenWidth;

    if (
      showLateralDrawer.value &&
      previousValue <= DRAWER_BREAKPOINT &&
      currentScreenWidth > DRAWER_BREAKPOINT
    ) {
      showLateralDrawer.value = false;

      void nextTick(() => (showLateralDrawer.value = true));
    }
  }),
);

/**
 * Allows you to control drawer's behaviors from outside the layout page
 */
export function useLateralDrawer() {
  return {
    showLateralDrawer,
    isDrawerOpen,
    isDrawerMini,
    isMobile,
  };
}
