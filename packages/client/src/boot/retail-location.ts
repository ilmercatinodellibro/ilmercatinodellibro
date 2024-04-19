import { until } from "@vueuse/core";
import { boot } from "quasar/wrappers";
import { nextTick, watch } from "vue";
import { useTheme } from "src/composables/use-theme";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

export default boot(async ({ router }) => {
  const { loading, selectedLocationId, selectedLocation } =
    useRetailLocationService();

  const ensureLocationInitialized = Promise.all([
    until(selectedLocationId).toBeTruthy(),
    until(loading).toBe(false),
  ]);

  const { theme, hasPendingChanges } = useTheme();
  watch(
    selectedLocationId,
    async (locationId) => {
      if (!locationId) {
        return;
      }

      await ensureLocationInitialized;

      const locationTheme = selectedLocation.value.theme;
      theme.value = {
        colors: {
          ...locationTheme.colors,
        },
        logo: locationTheme.logo ? `/${locationTheme.logo}` : theme.value.logo,
      };
      // to avoid making theme editor seen as dirty
      void nextTick(() => {
        hasPendingChanges.value = false;
      });
    },
    { immediate: true },
  );

  const { isAuthenticated } = useAuthService();

  router.beforeEach(async (to) => {
    if (to.params.locationId) {
      selectedLocationId.value = to.params.locationId as string;
      await ensureLocationInitialized;
    }
  });

  if (!isAuthenticated.value) {
    await router.push({
      name: AvailableRouteNames.SelectLocation,
    });
    return;
  }

  // TODO: Use and enforce the user's preferred location (when implemented)
});
