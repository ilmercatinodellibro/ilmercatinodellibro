<template>
  <div class="fit q-pa-xl row">
    <q-spinner v-if="loading" />

    <div
      v-for="location in retailLocations"
      :key="location.id"
      class="col flex flex-center"
    >
      <q-btn
        :label="location.name"
        color="secondary"
        @click="selectLocation(location)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { AvailableRouteNames } from "src/models/routes";
import { useRetailLocationService } from "src/services/retail-location";
import { RetailLocationFragment } from "src/services/retail-location.graphql";

const { retailLocations, loading, selectedLocationId } =
  useRetailLocationService();

const router = useRouter();
async function selectLocation(location: RetailLocationFragment) {
  selectedLocationId.value = location.id;
  await router.push({
    name: AvailableRouteNames.Login,
    params: { locationId: location.id },
  });
}
</script>
