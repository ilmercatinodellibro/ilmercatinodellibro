<template>
  <q-page>
    <q-card class="absolute-full column gap-16 no-wrap q-ma-md">
      <q-card-section class="gap-8 items-center row">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('common.search')"
          class="col max-width-600"
          debounce="200"
          outlined
          type="search"
        >
          <template #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </q-input>

        <q-space />

        <q-btn
          :icon="mdiFilter"
          :label="$t('reserveBooks.filterButton')"
          class="text-transform-none"
          color="accent"
          @click="searchClassBooks()"
        />
      </q-card-section>

      <q-card-section class="col no-padding">
        <dialog-table
          v-model:pagination="tablePagination"
          :columns="columns"
          :filter="searchQuery"
          :loading="loading"
          :rows="rows"
          class="flex-delegate-height-management"
          @request="onRequest"
        >
          <template #body-cell-availability="{ value }">
            <q-td>
              <status-chip :value="value" />
            </q-td>
          </template>
          <template #body-cell-actions="{ row }">
            <q-td>
              <chip-button
                :color="row.meta.isAvailable ? 'primary' : 'accent'"
                :label="
                  $t(
                    `reserveBooks.${
                      row.meta.isAvailable ? 'reserveCopy' : 'requestCopy'
                    }`,
                  )
                "
                @click="reserveOrRequest(row)"
              />
            </q-td>
          </template>
        </dialog-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { mdiFilter, mdiMagnify } from "@quasar/extras/mdi-v7";
import { Dialog, QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import ClassFiltersDialog from "src/components/class-filters-dialog.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import { formatPrice } from "src/composables/use-misc-formats";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";

const { t } = useI18n();

const columns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    name: "isbn",
    field: "isbnCode",
    label: t("book.fields.isbn"),
    align: "left",
  },
  {
    name: "author",
    field: "authorsFullName",
    label: t("book.fields.author"),
    align: "left",
  },
  {
    name: "subject",
    field: "subject",
    label: t("book.fields.subject"),
    align: "left",
  },
  {
    name: "title",
    field: "title",
    label: t("book.fields.title"),
    align: "left",
  },
  {
    name: "availability",
    field: ({ meta }) => meta.isAvailable,
    label: t("book.fields.availability"),
    align: "left",
  },
  {
    name: "cover-price",
    field: "originalPrice",
    label: t("book.fields.coverPrice"),
    align: "left",
    format: formatPrice,
    classes: "text-strike text-black-54",
  },
  {
    name: "price",
    // TODO: add correct calculation
    field: ({ originalPrice }) => originalPrice,
    label: t("book.fields.price"),
    align: "left",
    format: formatPrice,
  },
  {
    name: "available-copies",
    // TODO: add field
    field: () => undefined,
    label: t("reserveBooks.availableCopies"),
    align: "left",
  },
  {
    name: "actions",
    field: () => undefined,
    label: "",
  },
]);

const currentPage = ref(0);
const rowsPerPage = ref(100);
const { booksPaginationDetails, loading, refetchBooks } = useBookService(
  currentPage,
  rowsPerPage,
);

const rows = ref<BookSummaryFragment[]>([]);
const tablePagination = ref({
  page: currentPage.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  rowsPerPage: rowsPerPage.value,
} satisfies QTableProps["pagination"]);

const searchQuery = ref("");

const onRequest: QTableProps["onRequest"] = async ({ pagination }) => {
  loading.value = true;

  const newBooks = await refetchBooks({
    page: pagination.page - 1,
    rows: pagination.rowsPerPage,
    filter: {
      search: searchQuery.value,
    },
  });
  tablePagination.value.rowsNumber =
    newBooks?.data.books.rowsCount ?? tablePagination.value.rowsNumber;

  rows.value = newBooks?.data.books.rows ?? rows.value;

  tablePagination.value.rowsPerPage = pagination.rowsPerPage;
  tablePagination.value.page = pagination.page;

  loading.value = false;
};

function searchClassBooks() {
  Dialog.create({
    component: ClassFiltersDialog,
  }).onOk(() => void 0);
}

function reserveOrRequest(book: BookSummaryFragment) {
  if (book.meta.isAvailable) {
    // FIXME: reserve book
    return;
  }
  // FIXME: request book
}
</script>

<style scoped lang="scss">
.text-transform-none {
  text-transform: none;
}
</style>
