import { useGetRetailLocationsQuery } from "src/services/retail-location.graphql";

export function useRetailLocationService() {
  const { retailLocations, loading } = useGetRetailLocationsQuery();

  return {
    retailLocations,
    loading,
  };
}
