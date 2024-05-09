<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters
        :model-value="tableFilter"
        :filter-options="filterOptions"
        @update:model-value="updateFilters"
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

      <q-card-section class="col no-wrap q-pa-none row">
        <q-table
          ref="tableRef"
          v-model:pagination="pagination"
          :columns="columns"
          :filter="tableFilter"
          :filter-method="filterMethod"
          :loading="loading"
          :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
          :rows="tableRows"
          square
          class="col"
          @request="onRequest"
        >
          <template #body-cell-status="{ value }">
            <q-td>
              <status-chip :value="value" />
            </q-td>
          </template>

          <template #body-cell-utility="{ value }">
            <q-td>
              <utility-chip :utility="value" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { mdiPlus } from "@quasar/extras/mdi-v7";
import { startCase, toLower } from "lodash-es";
import { Dialog, QTable, QTableColumn, QTableProps } from "quasar";
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { BookCreateInput } from "src/@generated/graphql";
import AddBookDialog from "src/components/add-book-dialog.vue";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import UtilityChip from "src/components/utility-chip.vue";
import { useTranslatedFilters } from "src/composables/use-filter-translations";
import { notifyError } from "src/helpers/error-messages";
import { BookCompleteFilters, TableFilters } from "src/models/book";
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

const filterOptions = useTranslatedFilters("book.filters.options");

const tableFilter = reactive<TableFilters>({
  searchQuery: "",
  schoolFilters: {
    schoolCodes: [],
    courses: [],
  },
  filters: [],
});

function updateFilters({ filters, schoolFilters, searchQuery }: TableFilters) {
  tableFilter.filters = filters;
  tableFilter.schoolFilters = schoolFilters;
  tableFilter.searchQuery = searchQuery;
}

const filterMethod: QTableProps["filterMethod"] = (rows) => {
  return rows as BookSummaryFragment[];
};

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
  },
  {
    name: "title",
    label: t("book.fields.title"),
    field: "title",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    name: "price",
    label: t("book.fields.coverPrice"),
    field: "originalPrice",
    align: "left",
    format: (val: string) => formatPrice(val),
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
      filter: {
        isAvailable: (tableFilter.filters as BookCompleteFilters[]).includes(
          "isAvailable",
        ),
        search: tableFilter.searchQuery,
      },
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
  }).onOk(async (input: Omit<BookCreateInput, "id">) => {
    try {
      await createBook({
        input,
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
