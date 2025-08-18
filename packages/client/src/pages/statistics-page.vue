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
          {{ t(`retailLocation.statisticsTabs.${tab}`) }}
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
            v-for="(item, index) in statistics"
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

interface StatisticsEntry {
  label: string;
  value?: string;
  suffix?: string;
}

const { t } = useI18n();

const { selectedLocation } = useRetailLocationService();

const { retailLocationStatistics, loading: statisticsLoading } =
  useRetailLocationStatisticsQuery(
    {
      retailLocationId: selectedLocation.value.id,
    },
    { fetchPolicy: "network-only" },
  );

const statistics = computed<StatisticsEntry[]>(() => [
  {
    label: t("retailLocation.statistics.booksInTheSystem"),
    value: retailLocationStatistics.value?.bookCopiesCount.toString(),
  },
  {
    label: t("retailLocation.statistics.booksInWarehouse"),
    value: retailLocationStatistics.value?.booksInWarehouseCount.toString(),
  },
  {
    label: t("retailLocation.statistics.salableBooks"),
    value: retailLocationStatistics.value?.salableBooksCount.toString(),
  },
  {
    label: t("retailLocation.statistics.booksWithProblemsInWarehouse"),
    value:
      retailLocationStatistics.value?.booksWithProblemsInWarehouseCount.toString(),
  },
  {
    label: t("retailLocation.statistics.booksWithProblems"),
    value: retailLocationStatistics.value?.booksWithProblemsCount.toString(),
  },
  {
    label: t("retailLocation.statistics.returnedBooks"),
    value: retailLocationStatistics.value?.returnedBooksCount.toString(),
  },
  {
    label: t("retailLocation.statistics.donatedBooks"),
    value: retailLocationStatistics.value?.donatedBooksCount.toString(),
  },
  {
    label: t("retailLocation.statistics.reimbursedBooks"),
    value: retailLocationStatistics.value?.reimbursedBooksCount.toString(),
  },
  {
    label: t("retailLocation.statistics.reimbursedAmount"),
    value: retailLocationStatistics.value?.reimbursedAmount.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.activeRequests"),
    value: retailLocationStatistics.value?.activeRequestsCount.toString(),
  },
  {
    label: t("retailLocation.statistics.activeReservations"),
    value: retailLocationStatistics.value?.activeReservationsCount.toString(),
  },
  {
    label: t("retailLocation.statistics.sales"),
    value: retailLocationStatistics.value?.salesCount.toString(),
  },
  {
    label: t("retailLocation.statistics.activeSales"),
    value: retailLocationStatistics.value?.activeSalesCount.toString(),
  },
  {
    label: t("retailLocation.statistics.refundedSales"),
    value: retailLocationStatistics.value?.refundedSalesCount.toString(),
  },
  {
    label: t("retailLocation.statistics.settleable"),
    value: retailLocationStatistics.value?.settleableAmount.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.toSettle"),
    value: retailLocationStatistics.value?.toSettleAmount.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.settled"),
    value: retailLocationStatistics.value?.settledAmount.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.grossRevenue"),
    value: retailLocationStatistics.value?.grossRevenue.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.netRevenue"),
    value: retailLocationStatistics.value?.netRevenue.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.adminAccountsRevenue"),
    value: retailLocationStatistics.value?.adminAccountsRevenue.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.activeUsers"),
    value: retailLocationStatistics.value?.activeUsersCount.toString(),
  },
  {
    label: t("retailLocation.statistics.buyingCustomers"),
    value: retailLocationStatistics.value?.buyingCustomersCount.toString(),
  },
  {
    label: t("retailLocation.statistics.sellingCustomers"),
    value: retailLocationStatistics.value?.sellingCustomersCount.toString(),
  },
  {
    label: t("retailLocation.statistics.buyingOrSellingCustomers"),
    value: retailLocationStatistics.value?.customersCount.toString(),
  },
  {
    label: t("retailLocation.statistics.usersWithDiscount"),
    value: retailLocationStatistics.value?.usersWithDiscountCount.toString(),
  },
  {
    label: t("retailLocation.statistics.requestingUsers"),
    value: retailLocationStatistics.value?.requestingUsersCount.toString(),
  },
  {
    label: t("retailLocation.statistics.purchasedOrSoldBooksAverage"),
    value:
      retailLocationStatistics.value?.purchasedOrSoldBooksAverage.toFixed(2),
  },
  {
    label: t("retailLocation.statistics.soldBooksFromSellersAverage"),
    value:
      retailLocationStatistics.value?.soldBooksFromSellersAverage.toFixed(2),
  },
  {
    label: t("retailLocation.statistics.purchasedBooksFromBuyersAverage"),
    value:
      retailLocationStatistics.value?.purchasedBooksFromBuyersAverage.toFixed(
        2,
      ),
  },
  {
    label: t("retailLocation.statistics.settleableMoneyAverage"),
    value: retailLocationStatistics.value?.settleableMoneyAverage.toFixed(2),
    suffix: "€",
  },
  ...(retailLocationStatistics.value?.activeUsersPerLocaleCount ?? []).map(
    ({ count, locale }) => ({
      label: t("retailLocation.statistics.activeUsersLanguage", {
        locale: languages.find(({ code }) => code === locale)?.label,
      }),
      value: count.toString(),
    }),
  ),
  {
    label: t("retailLocation.statistics.soldBooksOriginalPriceTotal"),
    value:
      retailLocationStatistics.value?.soldBooksOriginalPriceTotal.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.sellingCustomersIncomeAverage"),
    value:
      retailLocationStatistics.value?.sellingCustomersIncomeAverage.toFixed(2),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.buyingCustomersFullExpenseAverage"),
    value:
      retailLocationStatistics.value?.buyingCustomersFullExpenseAverage.toFixed(
        2,
      ),
    suffix: "€",
  },
  {
    label: t(
      "retailLocation.statistics.buyingCustomersDiscountedExpenseAverage",
      {
        sellRate: selectedLocation.value.sellRate,
      },
    ),
    value:
      retailLocationStatistics.value?.buyingCustomersDiscountedExpenseAverage.toFixed(
        2,
      ),
    suffix: "€",
  },
  {
    label: t("retailLocation.statistics.buyingCustomersSavingAverage"),
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
</style>
