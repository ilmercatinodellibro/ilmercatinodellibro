import { until } from "@vueuse/core";
import { boot } from "quasar/wrappers";
import { nextTick, watch } from "vue";
import { useTheme } from "src/composables/use-theme";
import { useRetailLocationService } from "src/services/retail-location";

export default boot(({ router }) => {
  const { loading, selectedLocationId, selectedLocation, retailLocations } =
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

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- should not happen, meant to help with debugging
      if (!selectedLocation.value) {
        console.error(
          retailLocations.value.length === 0
            ? "No retail locations have been found. Make sure the DB is seeded properly."
            : `Location with id ${locationId} not found`,
        );
        return;
      }

      const locationTheme = selectedLocation.value.theme;
      theme.value = {
        colors: {
          ...locationTheme.colors,
        },
        logo: locationTheme.logo
          ? `/location/${locationId}/logo/${locationTheme.logo}`
          : theme.value.logo,
      };
      // to avoid making theme editor seen as dirty
      void nextTick(() => {
        hasPendingChanges.value = false;
      });
    },
    { immediate: true },
  );

  router.beforeEach(async (to) => {
    if (to.params.locationId) {
      selectedLocationId.value = to.params.locationId as string;
      await ensureLocationInitialized;
    }
  });

  // TODO: Use and enforce the user's preferred location (when implemented)
});
