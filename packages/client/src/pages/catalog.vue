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
          binary-state-sort
          row-key="isbn"
          square
          table-header-class="table-header"
          class="col"
          @request="onRequest"
        >
          <!-- TODO: add the right value checks for colors and icon -->
          <template #body-cell-status="{ value }">
            <q-td>
              <div class="cell-wrapper">
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
            <utility-chip :value="value" />
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
import { Book } from "src/@generated/graphql";
import AddBookDialog from "src/components/add-book-dialog.vue";
import FilterBySchoolDialog from "src/components/filter-by-school-dialog.vue";
import UtilityChip from "src/components/utility-chip.vue";
import { useTranslatedFilters } from "src/composables/use-filter-translations";
import { useBookService } from "src/services/book";
import { formatPrice } from "../composables/use-misc-formats";
const { t } = useI18n();

const tableRef = ref<QTable>();

const currentPage = ref(0);
const numberOfRows = ref(100);

const searchQuery = ref<string>("");

type BookSummary = Pick<
  Book,
  | "__typename"
  | "authorsFullName"
  | "id"
  | "isbnCode"
  | "originalPrice"
  | "publisherName"
  | "subject"
  | "title"
>;

enum BookFilters {
  Available,
  Sold,
  Booked,
  HighUtility,
  MediumUtility,
  LowUtility,
}

const filterOptions = useTranslatedFilters<BookFilters>("book.filters.options");

//TODO: Add actual logic with server fetch
const schoolFilterOptions = [
  ["SchoolCode0", "SchoolCode1", "SchoolCode2", "SchoolCode3"],
  ["Address0", "Address1", "Address2", "Address3", "Address4"],
];

const subjects = ["Subject1", "Subject2"];

const filters = ref([]);
const schoolFilters = ref([] as string[][]);

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200];

const { refetchBooks, booksPaginationDetails } = useBookService(
  currentPage,
  numberOfRows,
  searchQuery,
);

const bookLoading = ref(false);

const tableRows = ref([] as BookSummary[]);

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
        align: "left",
        classes: "col",
      },
    ] satisfies QTableProps["columns"],
);

const pagination = ref({
  rowsPerPage: numberOfRows.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  page: currentPage.value,
  descending: false,
});

onMounted(() => {
  tableRef.value?.requestServerInteraction();
});

const onRequest: QTable["onRequest"] = function (props) {
  bookLoading.value = true;

  refetchBooks({
    page: props.pagination.page - 1,
    rows: props.pagination.rowsPerPage,
    filter: searchQuery.value,
  })
    ?.then((payload) => {
      pagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

      tableRows.value.splice(
        0,
        tableRows.value.length,
        ...payload.data.books.rows,
      );

      pagination.value.page = props.pagination.page;
      pagination.value.rowsPerPage = props.pagination.rowsPerPage;
      bookLoading.value = false;
    })
    .catch((error) => {
      console.error("Couldn't fetch books: ", error);
    });
};

function openSchoolFilterDialog() {
  Dialog.create({
    component: FilterBySchoolDialog,
    componentProps: {
      filters: schoolFilterOptions,
      selectedFilters: schoolFilters.value,
    },
  }).onOk((payload: string[][]) => {
    schoolFilters.value = payload;
  });
}

function openBookDialog() {
  Dialog.create({
    component: AddBookDialog,
    componentProps: {
      subjects,
    },
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

:deep(.utility-chip) {
  text-transform: uppercase;
  font-size: 14px;
  line-height: 16px;
  user-select: none;
}

:deep(thead) {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #fff;
}
</style>
