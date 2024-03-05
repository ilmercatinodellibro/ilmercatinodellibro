<template>
  <q-page>
    <q-card class="absolute-full column items-stretch no-wrap q-ma-md">
      <q-card-section class="q-pa-md">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('common.search')"
          class="col max-width-600"
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
        class="col column dialog-panels flex-delegate-height-management no-wrap"
      >
        <q-tab-panel
          v-for="tab in Object.values(PageTab)"
          :key="tab"
          :name="tab"
          class="col column flex-delegate-height-management no-padding no-wrap"
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
              <q-td class="text-center">
                <!-- TODO: change to correct book status type -->
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
              <q-td>
                <chip-button
                  :label="$t('myBooks.cancelReservation')"
                  color="primary"
                  @click="cancelReservation(row)"
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
import { NamedColor, QTab, QTableColumn } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import chipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import { formatPrice } from "src/composables/use-misc-formats";
import { useAuthService } from "src/services/auth";
import {
  BookCopyDetailsFragment,
  useGetBookCopiesByOwnerQuery,
} from "src/services/book-copy.graphql";

const { user } = useAuthService();

const { /* bookCopiesByOwner,*/ loading } = useGetBookCopiesByOwnerQuery({
  userId: user.value?.id ?? "",
});

// FIXME: remove stub
const bookCopiesByOwner = ref([
  {
    book: {
      authorsFullName: "Autore sample",
      id: "",
      isbnCode: "ISBN sample",
      meta: {
        isAvailable: true,
      },
      originalPrice: 100,
      publisherName: "",
      retailLocationId: "",
      subject: "Materia sample",
      title: "Titolo molto molto molto molto molto molto lungo sample",
    },
    code: "",
    createdAt: 0,
    createdById: "",
    id: "",
    owner: {
      email: "",
      firstname: "",
      lastname: "",
      id: "0",
    },
    updatedAt: 0,
    updatedById: "",
  },
]);

enum PageTab {
  DELIVERED = "delivered",
  RESERVED = "reserved",
  PURCHASED = "purchased",
}

const tableRowsByTab = computed<Record<PageTab, BookCopyDetailsFragment[]>>(
  () => ({
    delivered: bookCopiesByOwner.value.filter(
      ({ owner }) => owner.id, // TODO: add correct filter to all rows
    ),
    purchased: bookCopiesByOwner.value.filter(({ owner }) => owner.id),
    reserved: bookCopiesByOwner.value.filter(({ owner }) => owner.id),
  }),
);

const { t } = useI18n();

const commonColumns = computed<QTableColumn<BookCopyDetailsFragment>[]>(() => [
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
  {
    name: "cover-price",
    field: ({ book }) => book.originalPrice,
    label: t("book.fields.price"),
    align: "left",
    format: formatPrice,
    classes: "text-strike text-black-54",
  },
]);

const columns = computed<
  Record<PageTab, QTableColumn<BookCopyDetailsFragment>[]>
>(() => ({
  delivered: [
    {
      name: "status",
      // TODO: add the field
      field: () => undefined,
      label: t("book.fields.status"),
      align: "left",
    },
    ...commonColumns.value,
    {
      name: "sale-price",
      field: ({ book }) => book.originalPrice,
      label: t("myBooks.receivedAmount"),
      align: "left",
      // TODO: change price to the right calculation
      format: formatPrice,
    },
  ],
  purchased: [
    ...commonColumns.value,
    {
      name: "paid-price",
      // TODO: add correct field
      field: ({ book }) => book.originalPrice,
      label: t("myBooks.priceYouPaid"),
      align: "left",
      format: formatPrice,
    },
  ],
  reserved: [
    ...commonColumns.value,
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
}));

const selectedTab = ref(PageTab.DELIVERED);

const searchQuery = ref("");

// TODO: update to correct field
const totalSale = ref(
  sumBy(tableRowsByTab.value.delivered, ({ book }) => book.originalPrice),
);

// TODO: replace book status once it is implemented on the server
enum BookStatus {
  SOLD = "sold",
  NOT_SOLD = "not-sold",
  RETURNED = "returned",
  DONATED = "donated",
}

const statusChipData = computed<
  Record<
    BookStatus,
    { color: NamedColor; icon: string; label: string; dark?: boolean }
  >
>(() => ({
  sold: {
    color: "positive",
    icon: mdiCurrencyEur,
    label: t("myBooks.statusLabels.donated"),
    dark: true,
  },
  "not-sold": {
    color: "red-5",
    icon: mdiCurrencyEurOff,
    label: t("myBooks.statusLabels.notSold"),
    dark: true,
  },
  returned: {
    color: "grey-5",
    icon: mdiBookArrowLeft,
    label: t("myBooks.statusLabels.returned"),
  },
  donated: {
    color: "amber",
    icon: mdiGift,
    label: t("myBooks.statusLabels.donated"),
  },
}));

function cancelReservation(bookCopy: BookCopyDetailsFragment) {
  // FIXME: cancel reservation
  bookCopy;
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
}
</style>
