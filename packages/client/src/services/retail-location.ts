import { createSharedComposable } from "@vueuse/core";
import { ComputedRef, computed, ref } from "vue";
import {
  RetailLocationFragment,
  useGetRetailLocationsQuery,
} from "src/services/retail-location.graphql";

export const useRetailLocationService = createSharedComposable(() => {
  const { retailLocations, loading } = useGetRetailLocationsQuery();

  const selectedLocationId = ref<string>();
  const selectedLocation = computed(() => {
    const locationId = selectedLocationId.value;
    const locations = retailLocations.value;

    if (locations.length === 0 || !locationId) {
      return undefined;
    }

    return locations.find(({ id }) => id === locationId);
  });

  return {
    retailLocations,
    loading,

    selectedLocationId,
    // We cast it to avoid having to assert it every time we use it. It's only undefined in the location selection page.
    selectedLocation: selectedLocation as ComputedRef<RetailLocationFragment>,
  };
});
