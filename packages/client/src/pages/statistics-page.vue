<template>
  <!--
    col, column, full-height, row classes at each level are needed
    to allow for scroll delegation, provided by flex-delegate-height-management class, to work
  -->
  <q-page class="full-height q-pa-md row">
    <q-card class="col column">
      <q-card-section class="text-h5 text-primary">
        {{ $t(`routesNames.${AvailableRouteNames.Statistics}`) }}
      </q-card-section>

      <q-separator />

      <!-- Without "full-width" class setting a fixed width for tabs, its length would cause a visible overflow when in mobile viewports -->
      <q-tabs
        v-model="activeTab"
        active-color="accent"
        align="justify"
        class="full-width"
        mobile-arrows
      >
        <q-tab v-for="tab in StatisticsTab" :key="tab" :name="tab">
          {{ t(`retailLocation.statistics.${tab}`) }}
        </q-tab>
      </q-tabs>

      <q-tab-panels
        v-model="activeTab"
        class="flex-delegate-height-management q-pa-md"
      >
        <q-tab-panel
          :name="StatisticsTab.GENERAL"
          class="full-height gap-24 grid"
        >
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
        </q-tab-panel>

        <q-tab-panel :name="StatisticsTab.DELIVERY" class="column flex-center">
          <statistics-chart
            :data="deliveriesChartData"
            :loading="deliveriesLoading"
          />
        </q-tab-panel>

        <q-tab-panel :name="StatisticsTab.SALE" class="column flex-center">
          <statistics-chart :data="salesChartData" :loading="salesLoading" />
        </q-tab-panel>

        <q-tab-panel :name="StatisticsTab.SETTLE" class="column flex-center">
          <statistics-chart
            :data="settlementsChartData"
            :loading="settlementsLoading"
          />
        </q-tab-panel>

        <q-tab-panel :name="StatisticsTab.RETURN" class="column flex-center">
          <statistics-chart
            :data="returningsChartData"
            :loading="returningsLoading"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import StatisticsChart from "src/components/statistics-chart.vue";
import { languages } from "src/models/language";
import { AvailableRouteNames } from "src/models/routes";
import { StatisticsTab } from "src/pages/statistics-page";
import { useRetailLocationService } from "src/services/retail-location";
import {
  useGetDeliveriesChartDataQuery,
  useGetReturningsChartDataQuery,
  useGetSalesChartDataQuery,
  useGetSettlementsChartDataQuery,
  useRetailLocationStatisticsQuery,
} from "src/services/retail-location.graphql";

const { t } = useI18n();

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
    label: "Utenti attivi",
    value: retailLocationStatistics.value?.activeUsersCount.toString(),
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
    label: "Utenti con sconto ISEE",
    value: retailLocationStatistics.value?.iseeUsersCount.toString(),
  },
  {
    label: "Utenti che hanno richiesto libri",
    value: retailLocationStatistics.value?.requestingUsersCount.toString(),
  },
  {
    label: "Media dei libri venduti o comprati per utente",
    value:
      retailLocationStatistics.value?.purchasedOrSoldBooksAverage.toFixed(2),
  },
  {
    label: "Media dei libri venduti da chi ha venduto almeno un libro",
    value:
      retailLocationStatistics.value?.soldBooksFromSellersAverage.toFixed(2),
  },
  {
    label: "Media dei libri comprati da chi ha comprato almeno un libro",
    value:
      retailLocationStatistics.value?.purchasedBooksFromBuyersAverage.toFixed(
        2,
      ),
  },
  {
    label: "Media del denaro liquidabile per utente",
    value: retailLocationStatistics.value?.settleableMoneyAverage.toFixed(2),
    suffix: "€",
  },
  ...(retailLocationStatistics.value?.activeUsersPerLocaleCount ?? []).map(
    ({ count, locale }) => ({
      label: `Utenti che hanno selezionato la lingua ${languages.find(({ code }) => code === locale)?.label}`,
      value: count.toString(),
    }),
  ),
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

const activeTab = ref(StatisticsTab.GENERAL);

const deliveriesEnabled = computed(
  () => activeTab.value === StatisticsTab.DELIVERY,
);
const { deliveriesChartData, loading: deliveriesLoading } =
  useGetDeliveriesChartDataQuery(
    {
      retailLocationId: selectedLocation.value.id,
    },
    () => ({
      enabled: deliveriesEnabled.value,
      fetchPolicy: "network-only",
    }),
  );

const salesEnabled = computed(() => activeTab.value === StatisticsTab.SALE);
const { salesChartData, loading: salesLoading } = useGetSalesChartDataQuery(
  {
    retailLocationId: selectedLocation.value.id,
  },
  () => ({
    enabled: salesEnabled.value,
    fetchPolicy: "network-only",
  }),
);

const settlementsEnabled = computed(
  () => activeTab.value === StatisticsTab.SETTLE,
);
const { settlementsChartData, loading: settlementsLoading } =
  useGetSettlementsChartDataQuery(
    {
      retailLocationId: selectedLocation.value.id,
    },
    () => ({
      enabled: settlementsEnabled.value,
      fetchPolicy: "network-only",
    }),
  );

const returningsEnabled = computed(
  () => activeTab.value === StatisticsTab.RETURN,
);
const { returningsChartData, loading: returningsLoading } =
  useGetReturningsChartDataQuery(
    {
      retailLocationId: selectedLocation.value.id,
    },
    () => ({
      enabled: returningsEnabled.value,
      fetchPolicy: "network-only",
    }),
  );
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
</style>
