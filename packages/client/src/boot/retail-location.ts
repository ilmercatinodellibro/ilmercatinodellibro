import { until } from "@vueuse/core";
import { boot } from "quasar/wrappers";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

export default boot(async ({ router }) => {
  const { loading, selectedLocationId } = useRetailLocationService();

  const { isAuthenticated } = useAuthService();
  if (!isAuthenticated.value) {
    await router.push({
      name: AvailableRouteNames.SelectLocation,
    });
  } else {
    await until(loading).toBe(false);
    // TODO: Use and enforce the user's preferred location (when implemented)
    selectedLocationId.value = "re";
  }
});
