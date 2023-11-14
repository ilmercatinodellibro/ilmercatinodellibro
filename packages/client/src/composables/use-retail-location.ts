import { computed, ref } from "vue";
import { useRetailLocationService } from "src/services/retail-location";

const { retailLocations, loading } = useRetailLocationService();
const selectedRetailLocationReadableId = ref("");

const selectedRetailLocation = computed(() => {
  const humanLocationId = selectedRetailLocationReadableId.value;
  const locations = retailLocations.value;

  if (locations.length === 0 || !humanLocationId) {
    return undefined;
  }

  return locations.find(({ id }) => id === humanLocationId);
});

export function useRetailLocations() {
  return {
    retailLocations,
    loading,
    selectedRetailLocation,
    selectedRetailLocationReadableId,
  };
}
