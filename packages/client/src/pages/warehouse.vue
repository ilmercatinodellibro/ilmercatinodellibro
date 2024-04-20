<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters
        v-model:filters="filters"
        v-model:search-query="searchQuery"
        v-model:school-filters="schoolFilters"
        :filter-options="filterOptions"
      >
        <template #side-actions>
          <q-btn
            v-if="screenWidth === WidthSize.SM"
            :icon="mdiDotsVertical"
            color="black-54"
            round
            flat
          >
            <q-menu>
              <q-item clickable @click="swapView()">
                <q-item-section>
                  <q-item-label>
                    {{
                      t(
                        `warehouse.${isSortedByCopyCode ? "sortByISBN" : "sortByCopyCode"}`,
                      )
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable @click="checkOtherWarehouse()">
                <q-item-section>
                  <q-item-label>
                    {{ t("warehouse.checkOtherWarehouse", [otherCityName]) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-menu>
          </q-btn>

          <template v-else>
            <q-btn
              :icon="mdiSort"
              :label="
                t(
                  `warehouse.${isSortedByCopyCode ? 'sortByISBN' : 'sortByCopyCode'}`,
                )
              "
              no-wrap
              outline
              @click="swapView()"
            />
            <q-btn
              :icon-right="mdiArrowRight"
              :label="t('warehouse.checkOtherWarehouse', [otherCityName])"
              color="accent"
              no-wrap
              @click="checkOtherWarehouse()"
            />
          </template>
        </template>
      </header-search-bar-filters>

      <dialog-table
        v-if="!isSortedByCopyCode"
        v-model:pagination="booksPagination"
        :columns="columns"
        :filter="tableFilter"
        :loading="booksLoading"
        :rows="books"
        class="flex-delegate-height-management"
        row-key="id"
        @request="onBooksRequest"
      >
        <template #header="props">
          <q-tr :props="props">
            <q-th auto-width />

            <q-th
              v-for="{ name, label } in props.cols"
              :key="name"
              :colspan="name === 'title' ? 2 : 1"
              :props="props"
            >
              {{ label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn
                :icon="props.expand ? mdiChevronUp : mdiChevronDown"
                color="black-54"
                flat
                round
                @click="props.expand = !props.expand"
              />
            </q-td>

            <q-td
              v-for="{ name, field, align } in columns"
              :key="name"
              :class="align ? `text-${align}` : 'text-left'"
              :colspan="name === 'title' ? 2 : 1"
              auto-width
            >
              <template v-if="name === 'status'">
                <status-chip :value="props.row.status" />
              </template>

              <template v-else>
                <span
                  :class="{
                    'text-underline': name === 'available-copies',
                  }"
                >
                  {{ getFieldValue(field, props.row) }}
                </span>
              </template>
            </q-td>
          </q-tr>

          <template v-if="props.expand">
            <book-copy-details-table
              :book-copy-columns="bookCopyColumns"
              :book-id="props.row.id"
              :table-width="9"
              @open-history="(bookCopy) => openHistory(bookCopy)"
              @open-problems-dialog="(bookCopy) => openProblemDialog(bookCopy)"
            />
          </template>
        </template>
      </dialog-table>

      <dialog-table
        v-else
        v-model:pagination="copyPagination"
        :columns="bookCopyColumns"
        :filter="tableFilter"
        :loading="copyLoading"
        :rows="
          // FIXME: bookCopies don't have the status field but the columns specify it
          bookCopies
        "
        class="flex-delegate-height-management"
        @request="onCopyRequest"
      >
        <template #body-cell-status="{ value }">
          <q-td>
            <book-copy-status-chip :value="value" />
          </q-td>
        </template>

        <template #body-cell-problems="{ row, value }">
          <q-td>
            <chip-button
              :color="value ? 'positive' : 'negative'"
              :label="
                t(
                  `manageUsers.booksMovementsDialog.${value ? 'solveProblem' : 'reportProblem'}`,
                )
              "
              @click="openProblemDialog(row)"
            />
          </q-td>
        </template>

        <template #body-cell-history="{ value }">
          <q-td>
            <q-btn
              :icon="mdiHistory"
              color="primary"
              flat
              round
              @click="openHistory(value)"
            />
          </q-td>
        </template>
      </dialog-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiArrowRight,
  mdiChevronDown,
  mdiChevronUp,
  mdiDotsVertical,
  mdiHistory,
  mdiSort,
} from "@quasar/extras/mdi-v7";
import { Dialog, QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import BookCopyDetailsTable from "src/components/book-copy-details-table.vue";
import BookCopyStatusChip from "src/components/book-copy-status-chip.vue";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import ProblemsDialog from "src/components/manage-users/problems-dialog.vue";
import ProblemsHistoryDialog from "src/components/manage-users/problems-history-dialog.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import { useTranslatedFilters } from "src/composables/use-filter-translations";
import { hasProblem } from "src/helpers/book-copy";
import { notifyError } from "src/helpers/error-messages";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
import { getFieldValue } from "src/helpers/table-helpers";
import {
  BookCopyDetailsWithStatus,
  BookCopyFilters,
  SchoolFilters,
} from "src/models/book";
import { useBookService } from "src/services/book";
import { useBookCopyService } from "src/services/book-copy";
import {
  BookCopyDetailsFragment,
  ProblemSummaryFragment,
  useReportProblemMutation,
  useResolveProblemMutation,
} from "src/services/book-copy.graphql";
import { BookSummaryFragment } from "src/services/book.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { selectedLocation, retailLocations } = useRetailLocationService();

const booksPage = ref(0);
const copyPage = ref(0);

const booksPerPage = ref(100);
const bookCopiesPerPage = ref(100);

const {
  books,
  loading: booksLoading,
  refetchBooks,
  booksPaginationDetails,
} = useBookService(booksPage, booksPerPage);

// FIXME: correctly implement/use the query
const { useGetBookCopiesQuery } = useBookCopyService();
const {
  loading: copyLoading,
  refetch: refetchBookCopies,
  bookCopies,
} = useGetBookCopiesQuery(
  {
    bookId: "",
  },
  () => ({
    enabled: false,
  }),
);

const { resolveProblem } = useResolveProblemMutation();
const { reportProblem } = useReportProblemMutation();

const { t } = useI18n();

// Setting this so that the side buttons don't overflow to two rows when the screen
// is below the minimum width to hold them in a single row
const smallScreenBreakpoint = 1694;
const screenWidth = useScreenWidth(smallScreenBreakpoint);

const isSortedByCopyCode = ref(false);

const filters = ref<BookCopyFilters[]>([]);
const filterOptions = useTranslatedFilters<BookCopyFilters>(
  "warehouse.filters.options",
);

const schoolFilters = ref<SchoolFilters>({ courses: [], schoolCodes: [] });
const searchQuery = ref("");

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
    name: "status",
    field: ({ meta }) => meta.isAvailable,
    label: t("book.fields.status"),
    align: "left",
  },
  {
    name: "available-copies",
    // FIXME: add field
    field: () => undefined,
    label: t("reserveBooks.availableCopies"),
    align: "center",
  },
  {
    name: "title",
    field: "title",
    label: t("book.fields.title"),
    align: "left",
  },
  {
    name: "problems",
    field: () => undefined,
    label: "",
  },
]);

const booksPagination = ref({
  rowsPerPage: booksPerPage.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  page: booksPage.value,
});
const copyPagination = ref({
  rowsPerPage: bookCopiesPerPage.value,
  // FIXME: add correct field once the query supports pagination
  rowsNumber: bookCopies.value.length,
  page: copyPage.value,
});

// TODO: send the filters to the server
const tableFilter = computed(() =>
  !searchQuery.value && filters.value.length === 0
    ? undefined
    : { searchTerm: searchQuery.value, filters: filters.value },
);

const bookCopyColumns = computed<QTableColumn<BookCopyDetailsWithStatus>[]>(
  () => [
    {
      name: "original-code",
      field: "originalCode",
      label: t("book.originalCode"),
      format: (field?: string) => field ?? "/",
      align: "left",
    },
    {
      name: "isbn",
      field: ({ book }) => book.isbnCode,
      label: t("book.fields.isbn"),
      align: "left",
    },
    {
      name: "status",
      field: "status",
      label: t("book.fields.status"),
      align: "left",
    },
    {
      name: "owner",
      field: ({ owner }) => owner.email,
      label: t("warehouse.owner"),
      align: "left",
    },
    {
      name: "problems",
      field: "problems",
      label: "",
      align: "center",
    },
    {
      name: "history",
      field: () => undefined,
      label: "",
    },
  ],
);

const onBooksRequest: QTableProps["onRequest"] = async ({
  pagination: { page, rowsPerPage },
}) => {
  booksLoading.value = true;

  await refetchBooks({
    page: page - 1,
    rows: rowsPerPage,
    filter: {
      search: searchQuery.value,
    },
  });

  booksPagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

  booksPagination.value.page = page;
  booksPagination.value.rowsPerPage = rowsPerPage;
  booksLoading.value = false;
};

const onCopyRequest: QTableProps["onRequest"] = async ({
  pagination: { page, rowsPerPage },
}) => {
  copyLoading.value = true;

  await refetchBookCopies();
  copyPagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

  copyPagination.value.page = page;
  copyPagination.value.rowsPerPage = rowsPerPage;
  copyLoading.value = false;
};

// We know that there are only two retail locations in the array,
// so we filter out the currently selected one
const otherCityName = computed(
  () =>
    retailLocations.value.filter(
      (location) => location.id !== selectedLocation.value.id,
    )[0]?.name,
);

function swapView() {
  isSortedByCopyCode.value = !isSortedByCopyCode.value;

  searchQuery.value = "";
  filters.value = [];
  schoolFilters.value = { courses: [], schoolCodes: [] };

  if (isSortedByCopyCode.value) {
    copyPagination.value.page = 0;
  } else {
    booksPagination.value.page = 0;
  }
}

function checkOtherWarehouse() {
  // FIXME: check other warehouse
}

function openProblemDialog(bookCopy: BookCopyDetailsFragment) {
  Dialog.create({
    component: ProblemsDialog,
    componentProps: {
      bookCopy,
    },
  }).onOk(async ({ solution, details, type }: ProblemSummaryFragment) => {
    if (hasProblem(bookCopy)) {
      try {
        await resolveProblem({
          input: { id: bookCopy.id, solution },
        });

        await refetchBookCopies();
      } catch (e) {
        notifyError(t("common.genericErrorMessage"));
      }
      return;
    }

    try {
      await reportProblem({
        input: {
          bookCopyId: bookCopy.id,
          details,
          type,
        },
      });

      await refetchBookCopies({
        bookId: bookCopy.book.id,
      });
    } catch (e) {
      notifyError(t("common.genericErrorMessage"));
    }
  });
}

function openHistory(bookCopy: BookCopyDetailsFragment) {
  Dialog.create({
    component: ProblemsHistoryDialog,
    componentProps: {
      bookCopy,
    },
  });
}
</script>
