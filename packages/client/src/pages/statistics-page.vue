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
  useRetailLocationStatisticsQuery(
    {
      retailLocationId: selectedLocation.value.id,
    },
    { fetchPolicy: "network-only" },
  );

const dataToShow = computed<
  { label: string; value?: string; suffix?: string }[]
>(() => [
  {
    label: "Libri movimentati",
    value: retailLocationStatistics.value?.bookCopiesCount.toString(),
  },
  {
    label: "Vendite",
    value: retailLocationStatistics.value?.salesCount.toString(),
  },
  {
    label: "Vendite andate a buon fine",
    value: retailLocationStatistics.value?.activeSalesCount.toString(),
  },
  {
    label: "Vendite con reso",
    value: retailLocationStatistics.value?.refundedSalesCount.toString(),
  },
  {
    label: "Libri in magazzino",
    value: retailLocationStatistics.value?.booksInWarehouseCount.toString(),
  },
  {
    label: "Libri in magazzino con problemi",
    value: retailLocationStatistics.value?.booksWithProblemsCount.toString(),
  },
  {
    label: "Libri in magazzino vendibili",
    value: retailLocationStatistics.value?.salableBooksCount.toString(),
  },
  {
    label: "Prenotazioni attive",
    value: retailLocationStatistics.value?.activeReservationsCount.toString(),
  },
  {
    label: "Richieste",
    value: retailLocationStatistics.value?.activeRequestsCount.toString(),
  },
  {
    label: "Libri restituiti",
    value: retailLocationStatistics.value?.returnedBooksCount.toString(),
  },
  {
    label: "Libri donati",
    value: retailLocationStatistics.value?.donatedBooksCount.toString(),
  },
  {
    label: "Libri rimborsati",
    value: retailLocationStatistics.value?.reimbursedBooksCount.toString(),
  },
  {
    label: "Totale incassato",
    value: retailLocationStatistics.value?.revenueTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: "Totale liquidato",
    value: retailLocationStatistics.value?.settledTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: "Totale da liquidare",
    value: retailLocationStatistics.value?.settleableTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: "Totale rimborsato",
    value: retailLocationStatistics.value?.reimbursedTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: "Utenti attivi",
    value: retailLocationStatistics.value?.activeUsersCount.toString(),
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
