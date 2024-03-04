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
          :name="PageTab.DELIVERED"
          class="col column flex-delegate-height-management no-padding no-wrap"
        >
          <!-- TODO: add loading and fix rows -->
          <dialog-table
            :columns="columns"
            :loading="loading"
            :rows="bookCopiesByOwner"
            :rows-per-page-options="[0]"
            class="col q-pt-sm"
          >
            <template #header="props">
              <q-tr class="bg-grey-1">
                <q-th colspan="4" />
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
          </dialog-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { mdiMagnify } from "@quasar/extras/mdi-v7";
import { QTableColumn } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import { useAuthService } from "src/services/auth";
import {
  BookCopyDetailsFragment,
  useGetBookCopiesByOwnerQuery,
} from "src/services/book-copy.graphql";

const { user } = useAuthService();

const { bookCopiesByOwner, loading } = useGetBookCopiesByOwnerQuery({
  userId: user.value?.id ?? "",
});

const { t } = useI18n();

const searchQuery = ref("");

const columns = computed<QTableColumn<BookCopyDetailsFragment>[]>(() => [
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
    format: (price: number) => `${price.toFixed(2)} €`,
    classes: "text-strike text-black-54",
  },
  {
    name: "sale-price",
    field: ({ book }) => book.originalPrice,
    label: t("myBooks.receivedAmount"),
    align: "left",
    // TODO: change price to the right calculation
    format: (price: number) => `${price.toFixed(2)} €`,
  },
]);

enum PageTab {
  DELIVERED = "delivered",
  RESERVED = "reserved",
  PURCHASED = "purchased",
}

const selectedTab = ref(PageTab.DELIVERED);

const totalSale = ref(0);
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
