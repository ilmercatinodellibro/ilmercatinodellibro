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
import { languages } from "src/models/language";
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
    label: "Utenti attivi",
    value: retailLocationStatistics.value?.activeUsersCount.toString(),
  },
  {
    label: "Libri movimentati",
    value: retailLocationStatistics.value?.bookCopiesCount.toString(),
  },
  {
    label: "Libri in magazzino",
    value: retailLocationStatistics.value?.booksInWarehouseCount.toString(),
  },
  {
    label: "Libri in magazzino vendibili",
    value: retailLocationStatistics.value?.salableBooksCount.toString(),
  },
  {
    label: "Libri in magazzino con problemi",
    value:
      retailLocationStatistics.value?.booksWithProblemsInWarehouseCount.toString(),
  },
  {
    label: "Libri con problemi",
    value: retailLocationStatistics.value?.booksWithProblemsCount.toString(),
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
    label: "Totale rimborsato",
    value: retailLocationStatistics.value?.reimbursedAmount.toFixed(2),
    suffix: "€",
  },
  {
    label: "Richieste",
    value: retailLocationStatistics.value?.activeRequestsCount.toString(),
  },
  {
    label: "Prenotazioni attive",
    value: retailLocationStatistics.value?.activeReservationsCount.toString(),
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
    label: "Liquidabile",
    value: retailLocationStatistics.value?.settleableAmount.toFixed(2),
    suffix: "€",
  },
  {
    label: "Da liquidare",
    value: retailLocationStatistics.value?.toSettleAmount.toFixed(2),
    suffix: "€",
  },
  {
    label: "Liquidato",
    value: retailLocationStatistics.value?.settledAmount.toFixed(2),
    suffix: "€",
  },
  {
    label: "Guadagno lordo",
    value: retailLocationStatistics.value?.grossRevenue.toFixed(2),
    suffix: "€",
  },
  {
    label: "Guadagno netto",
    value: retailLocationStatistics.value?.netRevenue.toFixed(2),
    suffix: "€",
  },
  {
    label: "Guadagno da utente admin",
    value: retailLocationStatistics.value?.adminAccountsRevenue.toFixed(2),
    suffix: "€",
  },
  {
    label: "Utenti che hanno comprato almeno un libro",
    value: retailLocationStatistics.value?.buyingCustomersCount.toString(),
  },
  {
    label: "Utenti che hanno venduto almeno un libro",
    value: retailLocationStatistics.value?.sellingCustomersCount.toString(),
  },
  {
    label: "Utenti che hanno comprato o venduto almeno un libro",
    value: retailLocationStatistics.value?.customersCount.toString(),
  },
  {
    label: "Utenti che hanno pagato la quota",
    value: retailLocationStatistics.value?.iseeUsersCount.toString(),
  },
  {
    label: "Utenti che hanno richiesto libri",
    value: retailLocationStatistics.value?.requestingUsersCount.toString(),
  },
  {
    label: "Media dei libri venduti o comprati per utente",
    value:
      retailLocationStatistics.value?.purchasedOrSoldBooksAverage.toString(),
  },
  {
    label: "Media dei libri venduti da chi ha venduto almeno un libro",
    value:
      retailLocationStatistics.value?.soldBooksFromSellersAverage.toString(),
  },
  {
    label: "Media dei libri comprati da chi ha comprato almeno un libro",
    value:
      retailLocationStatistics.value?.purchasedBooksFromBuyersAverage.toString(),
  },
  {
    label: "Media del denaro liquidabile per utente",
    value: retailLocationStatistics.value?.settleableMoneyAverage.toFixed(2),
    suffix: "€",
  },
  ...(retailLocationStatistics.value?.usersPerLanguage ?? []).map(
    ({ count, locale }) => ({
      label: `Utenti che hanno selezionato la lingua ${languages.find(({ code }) => code === locale)?.label}`,
      value: count.toString(),
    }),
  ),
  {
    label: "Totale soldi quota",
    value: retailLocationStatistics.value?.quotaMoneyTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: "Totale prezzo di copertina libri venduti",
    value:
      retailLocationStatistics.value?.soldBooksOriginalPriceTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: "Guadagno medio tra chi ha venduto almeno un libro",
    value:
      retailLocationStatistics.value?.sellingCustomersIncomeAverage.toFixed(2),
    suffix: "€",
  },
  {
    label: "Spesa media al 100% per chi ha comprato almeno un libro",
    value:
      retailLocationStatistics.value?.buyingCustomersFullExpenseAverage.toFixed(
        2,
      ),
    suffix: "€",
  },
  {
    label: `Spesa media al ${selectedLocation.value.sellRate}% per chi ha comprato almeno un libro`,
    value:
      retailLocationStatistics.value?.buyingCustomersDiscountedExpenseAverage.toFixed(
        2,
      ),
    suffix: "€",
  },
  {
    label: "Risparmio medio per chi ha comprato almeno un libro",
    value:
      retailLocationStatistics.value?.buyingCustomersSavingAverage.toFixed(2),
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
