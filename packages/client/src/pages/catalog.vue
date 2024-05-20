<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters
        v-model="tableFilter"
        :filter-options="filterOptions"
      >
        <template #side-actions>
          <q-btn
            :label="$t('book.addBook')"
            class="q-ma-sm"
            color="accent"
            no-wrap
            :icon="mdiPlus"
            @click="openBookDialog"
          />
        </template>
      </header-search-bar-filters>

      <q-table
        ref="tableRef"
        v-model:pagination="pagination"
        :columns="columns"
        :filter="tableFilter"
        :filter-method="filterMethod"
        :loading="loading"
        :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
        :rows="tableRows"
        class="col"
        @request="onRequest"
      >
        <template #body-cell-author="{ value, col }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>

        <template #body-cell-subject="{ value, col }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>

        <template #body-cell-status="{ value }">
          <q-td>
            <status-chip :value="value" />
          </q-td>
        </template>

        <template #body-cell-utility="{ value }">
          <q-td class="text-center">
            <utility-chip :utility="value" />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { mdiPlus } from "@quasar/extras/mdi-v7";
import { startCase, toLower } from "lodash-es";
import { Dialog, QTable, QTableColumn } from "quasar";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { BookCreateInput } from "src/@generated/graphql";
import AddBookDialog from "src/components/add-book-dialog.vue";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import TableCellWithTooltip from "src/components/manage-users/table-cell-with-tooltip.vue";
import UtilityChip from "src/components/utility-chip.vue";
import { useTableFilters } from "src/composables/use-table-filters";
import { notifyError } from "src/helpers/error-messages";
import { useBookService } from "src/services/book";
import {
  BookSummaryFragment,
  useCreateNewBookMutation,
} from "src/services/book.graphql";
import { formatPrice } from "../composables/use-misc-formats";

const { t } = useI18n();

const tableRef = ref<QTable>();

const currentPage = ref(0);
const numberOfRows = ref(100);

const { refetchFilterProxy, filterOptions, tableFilter, filterMethod } =
  useTableFilters("book.filters.options", true);

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200];

const {
  books: tableRows,
  refetchBooks,
  booksPaginationDetails,
  loading,
} = useBookService(currentPage, numberOfRows);

const columns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    name: "isbn",
    label: t("book.fields.isbn"),
    field: "isbnCode",
    align: "left",
  },
  {
    name: "author",
    label: t("book.fields.author"),
    field: "authorsFullName",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
    classes: "max-width-160 ellipsis",
  },
  {
    name: "publisher",
    label: t("book.fields.publisher"),
    field: "publisherName",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    name: "subject",
    label: t("book.fields.subject"),
    field: "subject",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
    classes: "max-width-160 ellipsis",
  },
  {
    name: "title",
    label: t("book.fields.title"),
    field: "title",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
    classes: "text-wrap",
  },
  {
    name: "price",
    label: t("book.fields.coverPrice"),
    field: "originalPrice",
    align: "left",
    format: formatPrice,
  },
  {
    name: "status",
    label: t("book.fields.status"),
    field: ({ meta }) => meta.isAvailable,
    align: "left",
  },
  {
    name: "utility",
    label: t("book.fields.utility"),
    field: "utility",
    align: "center",
  },
]);

const pagination = ref({
  rowsPerPage: numberOfRows.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  page: currentPage.value,
});

onMounted(() => {
  tableRef.value?.requestServerInteraction();
});

const onRequest: QTable["onRequest"] = async function (requestProps) {
  loading.value = true;

  try {
    await refetchBooks({
      page: requestProps.pagination.page - 1,
      rows: requestProps.pagination.rowsPerPage,
      filter: refetchFilterProxy.value,
    });

    pagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

    pagination.value.page = requestProps.pagination.page;
    pagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const { createBook } = useCreateNewBookMutation();
function openBookDialog() {
  Dialog.create({
    component: AddBookDialog,
  }).onOk(async (input: BookCreateInput) => {
    try {
      await createBook({
        input,
      });

      await refetchBooks({
        page: currentPage.value,
        rows: numberOfRows.value,
      });
    } catch {
      notifyError(t("bookErrors.addBook"));
    }
  });
}
</script>

<style scoped lang="scss">
// This is the suggested way from Quasar docs; simply adding
// the css to the element doesn't work and there is no table
// property to make the thead sticky otherwise
:deep(thead) {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #fff;
}
</style>
