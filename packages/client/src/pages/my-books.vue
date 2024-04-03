<template>
  <q-page>
    <q-card class="absolute-full column items-stretch no-wrap q-ma-md">
      <q-card-section class="q-pa-md">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('common.search')"
          class="max-width-600"
          outlined
          type="text"
        >
          <template #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </q-input>
      </q-card-section>

      <q-tabs v-model="selectedTab" align="justify" active-color="accent">
        <q-tab
          v-for="tab in Object.values(PageTab)"
          :key="tab"
          :name="tab"
          class="col text-black-54 text-weight-medium"
        >
          {{ $t(`myBooks.tabsTitles.${tab}`) }}
        </q-tab>
      </q-tabs>

      <q-tab-panels
        v-model="selectedTab"
        animated
        class="column dialog-panels flex-delegate-height-management hide-scrollbar no-wrap"
      >
        <q-tab-panel
          v-for="tab in Object.values(PageTab)"
          :key="tab"
          :name="tab"
          class="column flex-delegate-height-management no-padding no-wrap"
        >
          <dialog-table
            :columns="columns[tab]"
            :loading="loading"
            :rows="tableRowsByTab[tab]"
            :rows-per-page-options="[0]"
            class="col q-pt-sm"
          >
            <template v-if="tab === PageTab.DELIVERED" #header="props">
              <q-tr class="bg-grey-1">
                <q-th colspan="5" />
                <q-th class="text-left">
                  {{ $t("myBooks.total") }}
                </q-th>
                <q-th class="text-left">
                  {{ `${totalSale.toFixed(2)} €` }}
                </q-th>
              </q-tr>
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template
              v-if="tab === PageTab.DELIVERED"
              #body-cell-status="{ value }"
            >
              <q-td>
                <!-- TODO: update to correct book status type -->
                <q-chip
                  v-bind="
                    statusChipData[(value as BookStatus) ?? BookStatus.NOT_SOLD]
                  "
                  class="non-selectable"
                />
              </q-td>
            </template>

            <template
              v-if="tab === PageTab.RESERVED"
              #body-cell-actions="{ row }"
            >
              <q-td class="text-center">
                <chip-button
                  :label="$t('myBooks.cancelReservation')"
                  color="primary"
                  @click="cancelReservation(row)"
                />
              </q-td>
            </template>

            <template
              v-if="tab === PageTab.REQUESTED"
              #body-cell-availability="{ value }"
            >
              <q-td>
                <status-chip :value="value" />
              </q-td>
            </template>

            <template
              v-if="tab === PageTab.REQUESTED"
              #body-cell-reserve="{ value, row }"
            >
              <q-td>
                <chip-button
                  v-if="value"
                  :label="t('myBooks.reserve')"
                  color="primary"
                  @click="reserveBook(row)"
                />
              </q-td>
            </template>

            <template
              v-if="tab === PageTab.REQUESTED"
              #body-cell-cancel-request="{ row }"
            >
              <q-td>
                <chip-button
                  :label="t('myBooks.cancelRequest')"
                  color="accent"
                  @click="cancelRequest(row)"
                />
              </q-td>
            </template>
          </dialog-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiBookArrowLeft,
  mdiCurrencyEur,
  mdiCurrencyEurOff,
  mdiGift,
  mdiMagnify,
} from "@quasar/extras/mdi-v7";
import { sumBy } from "lodash-es";
import { QChipProps, QTab, QTableColumn } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import ChipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import { formatPrice } from "src/composables/use-misc-formats";
import { useAuthService } from "src/services/auth";
import {
  BookCopyDetailsFragment,
  useGetBookCopiesByOwnerQuery,
  useGetPurchasedBookCopiesQuery,
} from "src/services/book-copy.graphql";
import {
  GetRequestsDocument,
  RequestSummaryFragment,
  useDeleteRequestMutation,
  useGetRequestsQuery,
} from "src/services/request.graphql";
import { useReservationService } from "src/services/reservation";
import {
  ReservationSummaryFragment,
  useGetReservationsQuery,
} from "src/services/reservation.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { selectedLocation } = useRetailLocationService();
const { user } = useAuthService();

const { bookCopiesByOwner, loading } = useGetBookCopiesByOwnerQuery({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  userId: user.value!.id,
  retailLocationId: selectedLocation.value.id,
});

const { useCreateReservationsMutation, useDeleteReservationMutation } =
  useReservationService();
const { createReservations } = useCreateReservationsMutation();
const { deleteReservation } = useDeleteReservationMutation();
const { userReservations } = useGetReservationsQuery({
  retailLocationId: selectedLocation.value.id,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  userId: user.value!.id,
});
const { deleteBookRequest } = useDeleteRequestMutation();
const { bookRequests } = useGetRequestsQuery({
  retailLocationId: selectedLocation.value.id,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  userId: user.value!.id,
});
const { purchasedBookCopies } = useGetPurchasedBookCopiesQuery({
  retailLocationId: selectedLocation.value.id,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  userId: user.value!.id,
});

enum PageTab {
  DELIVERED = "delivered",
  RESERVED = "reserved",
  REQUESTED = "requested",
  PURCHASED = "purchased",
}

type TablesRowsTypes =
  | BookCopyDetailsFragment
  | ReservationSummaryFragment
  | RequestSummaryFragment;

const tableRowsByTab = computed<Record<PageTab, TablesRowsTypes[]>>(() => ({
  [PageTab.DELIVERED]: bookCopiesByOwner.value.filter(
    ({ owner }) => owner.id, // TODO: add correct filter to all rows
  ),
  [PageTab.PURCHASED]: purchasedBookCopies.value,
  [PageTab.REQUESTED]: bookRequests.value,
  [PageTab.RESERVED]: userReservations.value,
}));

const { t } = useI18n();

const commonColumns = computed<QTableColumn<TablesRowsTypes>[]>(() => [
  {
    name: "isbn",
    field: ({ book }) => book.isbnCode,
    label: t("book.fields.isbn"),
    align: "left",
  },
  {
    name: "author",
    field: ({ book }) => book.authorsFullName,
    label: t("book.fields.author"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "subject",
    field: ({ book }) => book.subject,
    label: t("book.fields.subject"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "title",
    field: ({ book }) => book.title,
    label: t("book.fields.title"),
    align: "left",
  },
]);

const coverPriceColumn = computed<QTableColumn<TablesRowsTypes>>(() => ({
  name: "cover-price",
  field: ({ book }) => book.originalPrice,
  label: t("book.fields.coverPrice"),
  align: "left",
  format: formatPrice,
  classes: "text-strike text-black-54",
}));

const columns = computed<Record<PageTab, QTableColumn<TablesRowsTypes>[]>>(
  () => ({
    [PageTab.DELIVERED]: [
      {
        name: "status",
        // TODO: add the field
        field: () => undefined,
        label: t("book.fields.status"),
        align: "left",
      },
      ...commonColumns.value,
      coverPriceColumn.value,
      {
        name: "sale-price",
        field: ({ book }) => book.originalPrice,
        label: t("myBooks.receivedAmount"),
        align: "left",
        // TODO: change price to the right calculation
        format: formatPrice,
      },
    ],
    [PageTab.PURCHASED]: [
      ...commonColumns.value,
      coverPriceColumn.value,
      {
        name: "paid-price",
        // TODO: update to correct field
        field: ({ book }) => book.originalPrice,
        label: t("myBooks.priceYouPaid"),
        align: "left",
        format: formatPrice,
      },
    ],
    [PageTab.REQUESTED]: [
      ...commonColumns.value,
      {
        name: "availability",
        field: ({ book: { meta } }) => meta.isAvailable,
        label: t("myBooks.availability"),
        align: "left",
      },
      coverPriceColumn.value,
      {
        name: "price",
        field: ({ book }) => book.originalPrice,
        label: t("myBooks.price"),
        align: "left",
        format: formatPrice,
      },
      {
        name: "reserve",
        field: ({ book: { meta } }) => meta.isAvailable,
        label: "",
      },
      {
        name: "cancel-request",
        field: () => undefined,
        label: "",
      },
    ],
    [PageTab.RESERVED]: [
      ...commonColumns.value,
      coverPriceColumn.value,
      {
        name: "price",
        field: ({ book }) => book.originalPrice,
        label: t("myBooks.price"),
        align: "left",
        format: formatPrice,
      },
      {
        name: "actions",
        field: () => undefined,
        label: "",
      },
    ],
  }),
);

const selectedTab = ref(PageTab.DELIVERED);

const searchQuery = ref("");

// TODO: update to correct field
const totalSale = ref(
  sumBy(tableRowsByTab.value.delivered, ({ book }) => book.originalPrice),
);

// TODO: remove book status once it is implemented on the server
enum BookStatus {
  SOLD = "sold",
  NOT_SOLD = "not-sold",
  RETURNED = "returned",
  DONATED = "donated",
}

const statusChipData = computed<Record<BookStatus, QChipProps>>(() => ({
  [BookStatus.SOLD]: {
    color: "positive",
    icon: mdiCurrencyEur,
    label: t("myBooks.statusLabels.donated"),
    dark: true,
  },
  [BookStatus.NOT_SOLD]: {
    color: "red-5",
    icon: mdiCurrencyEurOff,
    label: t("myBooks.statusLabels.notSold"),
    dark: true,
  },
  [BookStatus.RETURNED]: {
    color: "grey-5",
    icon: mdiBookArrowLeft,
    label: t("myBooks.statusLabels.returned"),
  },
  [BookStatus.DONATED]: {
    color: "amber",
    icon: mdiGift,
    label: t("myBooks.statusLabels.donated"),
  },
}));

async function cancelReservation(reservation: ReservationSummaryFragment) {
  const { cache } = await deleteReservation({
    input: {
      id: reservation.id,
    },
  });

  cache.evict({
    id: cache.identify(reservation),
  });
  cache.gc();
  // TODO: add the related request back to the request list
}

async function reserveBook(request: RequestSummaryFragment) {
  if (!user.value) {
    return;
  }

  const { cache } = await createReservations({
    input: {
      bookIds: [request.book.id],
      userId: user.value.id,
      retailLocationId: selectedLocation.value.id,
    },
  });

  cache.updateQuery(
    {
      query: GetRequestsDocument,
      variables: {
        retailLocationId: selectedLocation.value.id,
        userId: user.value.id,
      },
    },
    (data) => {
      if (!data) {
        return;
      }
      return {
        bookRequests: data.bookRequests.filter(
          ({ id }) => id !== request.book.id,
        ),
      };
    },
  );
  cache.gc();
  // TODO: add the new reservation to the reservation list
}

async function cancelRequest(request: RequestSummaryFragment) {
  const { cache } = await deleteBookRequest({
    input: {
      id: request.id,
    },
  });

  cache.updateQuery(
    {
      query: GetRequestsDocument,
      variables: {
        retailLocationId: selectedLocation.value.id,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        userId: user.value!.id,
      },
    },
    (data) => {
      if (!data) {
        return;
      }
      return {
        bookRequests: data.bookRequests.filter(({ id }) => id !== request.id),
      };
    },
  );
  cache.gc();
}
</script>

<style lang="scss">
/*
  Adding this to make up for the child element of q-panels
  which is an otherwise inaccessible div
*/
.dialog-panels > .q-panel[role="tabpanel"],
.dialog-panels > * > .q-tab-panel[role="tabpanel"] {
  display: flex;
  overflow: auto;
  flex-grow: 1;
}
</style>
