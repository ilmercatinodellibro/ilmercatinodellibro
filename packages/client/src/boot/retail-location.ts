import { until } from "@vueuse/core";
import { boot } from "quasar/wrappers";
import { watch } from "vue";
import { useTheme } from "src/composables/use-theme";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

export default boot(async ({ router }) => {
  const { loading, selectedLocationId, selectedLocation } =
    useRetailLocationService();

  const { theme } = useTheme();
  watch(
    selectedLocationId,
    (locationId) => {
      if (!locationId) {
        return;
      }

      const locationTheme = selectedLocation.value.theme;
      theme.value = {
        colors: locationTheme.colors,
        logo: locationTheme.logo ? `/${locationTheme.logo}` : undefined,
      };
    },
    { immediate: true },
  );

  const { isAuthenticated } = useAuthService();
  if (!isAuthenticated.value) {
    await router.push({
      name: AvailableRouteNames.SelectLocation,
    });
    return;
  }

  await until(loading).toBe(false);
  // TODO: Use and enforce the user's preferred location (when implemented)
  selectedLocationId.value = "re";
});
