<template>
  <q-page class="catalog-page">
    <q-card
      class="absolute-full column no-wrap q-col-gutter-y-md q-ma-md q-pb-none q-px-none"
    >
      <q-card-section
        class="col-auto flex-center no-wrap q-col-gutter-md q-pr-none row"
      >
        <q-input
          v-model="searchQuery"
          type="search"
          class="col full-width search-bar"
          outlined
          :placeholder="$t('common.search')"
        >
          <template #append>
            <q-icon name="mdi-magnify" />
          </template>
        </q-input>
        <q-select
          v-model="filters"
          fit
          :options="filterOptions.map(({ key }) => key)"
          class="search-filter"
          bg-color="white"
          outlined
          multiple
        >
          <template #option="{ itemProps, opt, selected, toggleOption }">
            <q-item v-bind="itemProps">
              <q-item-section side top>
                <q-checkbox
                  :model-value="selected"
                  @update:model-value="toggleOption(opt)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label> {{ filterOptions[opt]?.label }} </q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template #after-options>
            <q-item clickable @click="openSchoolFilterDialog">
              <q-item-section>
                {{ $t("book.filters.school") }}
              </q-item-section>
            </q-item>
          </template>
          <template #selected>
            {{ $t("book.filter") }}
          </template>
        </q-select>

        <q-space />
        <q-item class="col col-shrink row">
          <q-btn
            :label="$t('book.addBook')"
            class="q-ma-sm"
            color="secondary"
            icon="mdi-plus"
            @click="openBookDialog"
          />
        </q-item>
      </q-card-section>

      <q-card-section class="col flex q-pb-none q-px-none">
        <q-table
          ref="tableRef"
          v-model:pagination="pagination"
          :columns="columns"
          :filter="searchQuery"
          :loading="bookLoading"
          :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
          :rows="tableRows"
          row-key="isbn"
          square
          class="col"
          @request="onRequest"
        >
          <!-- TODO: add the right value checks for colors and icon -->
          <template #body-cell-status="{ value }">
            <q-td>
              <div class="flex flex-center no-wrap q-col-gutter-md">
                <q-icon
                  :name="value ? 'mdi-check-circle' : 'mdi-cancel'"
                  :color="value ? 'green' : 'red'"
                  size="24px"
                />
                <span>
                  {{
                    $t(
                      `book.availability.${
                        value ? "available" : "notAvailable"
                      }`,
                    )
                  }}
                </span>
              </div>
            </q-td>
          </template>

          <template #body-cell-utility="{ value }">
            <q-td class="flex flex-center text-center">
              <utility-chip :value="value" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { startCase, toLower } from "lodash-es";
import { Dialog, QTable, QTableProps } from "quasar";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import AddBookDialog from "src/components/add-book-dialog.vue";
import FilterBySchoolDialog from "src/components/filter-by-school-dialog.vue";
import UtilityChip from "src/components/utility-chip.vue";
import { useTranslatedFilters } from "src/composables/use-filter-translations";
import { useBookService } from "src/services/book";
import { BookSummary } from "src/services/book.service";
import { formatPrice } from "../composables/use-misc-formats";
const { t } = useI18n();

const tableRef = ref<QTable>();

const currentPage = ref(0);
const numberOfRows = ref(100);

const searchQuery = ref("");

enum BookFilters {
  Available,
  Sold,
  Requested,
  HighUtility,
  MediumUtility,
  LowUtility,
}

const filterOptions = useTranslatedFilters<BookFilters>("book.filters.options");

//TODO: Add actual logic with server fetch
const schoolFilterOptions = {
  schoolCodes: ["SchoolCode0", "SchoolCode1", "SchoolCode2", "SchoolCode3"],
  addresses: ["Address0", "Address1", "Address2", "Address3", "Address4"],
};

const filters = ref([]);
const schoolFilters = ref<typeof schoolFilterOptions>();

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200];

const { refetchBooks, booksPaginationDetails } = useBookService(
  currentPage,
  numberOfRows,
  searchQuery,
);

const bookLoading = ref(false);

const tableRows = ref<BookSummary[]>([]);

const columns = computed(
  () =>
    [
      {
        name: "isbn",
        label: t("book.fields.isbn"),
        field: "isbnCode",
        align: "left",
        classes: "col col-shrink ellipsis",
      },
      {
        name: "author",
        label: t("book.fields.author"),
        field: "authorsFullName",
        align: "left",
        format: (val: string) => startCase(toLower(val)),
        classes: "col col-shrink ellipsis",
      },
      {
        name: "publisher",
        label: t("book.fields.publisher"),
        field: "publisherName",
        align: "left",
        format: (val: string) => startCase(toLower(val)),
        classes: "col col-shrink ellipsis",
      },
      {
        name: "subject",
        label: t("book.fields.subject"),
        field: "subject",
        align: "left",
        format: (val: string) => startCase(toLower(val)),
        classes: "col col-shrink ellipsis",
      },
      {
        name: "title",
        label: t("book.fields.title"),
        field: "title",
        align: "left",
        format: (val: string) => startCase(toLower(val)),
        classes: "col col-grow ellipsis",
      },
      {
        name: "price",
        label: t("book.fields.price"),
        field: "originalPrice",
        align: "left",
        format: (val: string) => formatPrice(val),
      },
      {
        name: "status",
        label: t("book.fields.status"),
        //TODO: add the field name
        field: "",
        align: "left",
      },
      {
        name: "utility",
        label: t("book.fields.utility"),
        //TODO: add the field name
        field: "",
        align: "center",
        classes: "col",
      },
    ] satisfies QTableProps["columns"],
);

const pagination = ref({
  rowsPerPage: numberOfRows.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  page: currentPage.value,
});

onMounted(() => {
  tableRef.value?.requestServerInteraction();
});

const onRequest: QTable["onRequest"] = async function (requestProps) {
  bookLoading.value = true;

  const newBooks = await refetchBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
    filter: searchQuery.value,
  });
  pagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

  tableRows.value.splice(
    0,
    tableRows.value.length,
    ...(newBooks?.data.books.rows ?? tableRows.value),
  );

  pagination.value.page = requestProps.pagination.page;
  pagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;
  bookLoading.value = false;
};

function openSchoolFilterDialog() {
  Dialog.create({
    component: FilterBySchoolDialog,
    componentProps: {
      filters: schoolFilterOptions,
      selectedFilters: schoolFilters.value,
    },
  }).onOk((payload: typeof schoolFilterOptions) => {
    schoolFilters.value = payload;
  });
}

function openBookDialog() {
  Dialog.create({
    component: AddBookDialog,
  }).onOk((payload: string[]) => {
    payload; // TODO: Load the new book in the database with the data passed from the dialog
  });
}
</script>

<style scoped lang="scss">
.search-bar {
  max-width: 600px;
}

.search-filter {
  width: 200px;
}

:deep(thead) {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #fff;
}
</style>
