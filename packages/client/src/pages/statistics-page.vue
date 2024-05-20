<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="text-h5 text-primary">
        {{ $t(`routesNames.${AvailableRouteNames.Statistics}`) }}
      </q-card-section>
      <q-separator />
      <q-card-section class="items-container row">
        <q-field
          v-for="(item, index) in dataToShow"
          :key="index"
          :label="item.label"
          outlined
          readonly
          stack-label
        >
          <template #control>
            <span class="full-width no-outline self-center" tabindex="0">
              {{
                statisticsLoading || item.value === undefined
                  ? "---"
                  : item.value
              }}
              {{ item.suffix }}
            </span>
          </template>
        </q-field>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AvailableRouteNames } from "src/models/routes";
import { useRetailLocationService } from "src/services/retail-location";
import { useRetailLocationStatisticsQuery } from "src/services/retail-location.graphql";

const { selectedLocation } = useRetailLocationService();

const { retailLocationStatistics, loading: statisticsLoading } =
  useRetailLocationStatisticsQuery({
    retailLocationId: selectedLocation.value.id,
  });

const dataToShow = computed<
  { label: string; value?: string; suffix?: string }[]
>(() => [
  {
    label: "Totale Libri Venduti",
    value: retailLocationStatistics.value?.totalSoldBooks.toString(),
  },
  {
    label: "Totale Libri Presenti",
    value: retailLocationStatistics.value?.totalPresentBooks.toString(),
  },
  {
    label: "Totale Libri Prenotati",
    value: retailLocationStatistics.value?.totalReservedBooks.toString(),
  },
  {
    label: "Totale Libri con Problemi",
    value: retailLocationStatistics.value?.totalBooksWithProblems.toString(),
  },
  {
    label: "Totale Libri Richiesti",
    value: retailLocationStatistics.value?.totalRequestedBooks.toString(),
  },
  {
    label: "Totale Incassato",
    value: retailLocationStatistics.value?.totalRevenue.toFixed(2),
    suffix: "€",
  },
  {
    label: "Totale Liquidato",
    value: retailLocationStatistics.value?.settledTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: "Totale da Liquidare",
    value: retailLocationStatistics.value?.settleableTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: "Totale Utenti",
    value: retailLocationStatistics.value?.totalUsers.toFixed(2),
    suffix: "€",
  },
]);
</script>

<style scoped lang="scss">
.items-container {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 500px));
  justify-content: space-evenly;
}
</style>
