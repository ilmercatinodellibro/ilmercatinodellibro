import { until } from "@vueuse/core";
import { omit } from "lodash-es";
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
    () => {
      if (!selectedLocationId.value) {
        return;
      }

      theme.value.colors = omit(selectedLocation.value.theme, ["__typename"]);
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
