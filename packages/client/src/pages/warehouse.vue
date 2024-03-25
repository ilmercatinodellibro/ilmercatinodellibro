<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters :query="searchQuery" @filter="updateTable">
        <template #side-actions>
          <q-btn
            :icon="mdiSort"
            :label="
              t(
                `warehouse.${isSortedByCopyCode ? 'sortByISBN' : 'sortByCopyCode'}`,
              )
            "
            no-wrap
            outline
            @click="swapSort()"
          />
          <q-btn
            :icon-right="mdiArrowRight"
            :label="t('warehouse.checkOtherWarehouse', [otherCityName])"
            color="accent"
            no-wrap
            @click="checkOtherWarehouse()"
          />
        </template>
      </header-search-bar-filters>

      <dialog-table
        v-show="!isSortedByCopyCode"
        v-model:pagination="isbnPagination"
        :columns="columns"
        :loading="isbnLoading"
        :rows="isbnRows"
        :search-query="searchQuery"
        class="flex-delegate-height-management"
        @request="onIsbnRequest"
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
              v-for="{ name, field } in columns"
              :key="name"
              :colspan="name === 'title' ? 2 : 1"
              auto-width
            >
              <template v-if="name === 'status'">
                <status-chip :value="props.row.status" />
              </template>

              <template v-else>
                <span
                  :class="{ 'text-underline': name === 'available-copies' }"
                >
                  {{ getFieldValue(field, props.row) }}
                </span>
              </template>
            </q-td>
          </q-tr>

          <template v-if="props.expand">
            <q-tr no-hover>
              <q-th auto-width />

              <q-th
                v-for="{ name, label } in bodyHeaderCols"
                :key="name"
                :colspan="getColspan(name)"
                class="height-48 text-left"
              >
                {{ label }}
              </q-th>
            </q-tr>

            <q-tr
              v-for="bookCopy in getBookCopies(props.row.id)"
              :key="bookCopy.id"
            >
              <q-td auto-width />

              <q-td
                v-for="{ name, field, format } in bodyHeaderCols"
                :key="name"
                :auto-width="name === 'problems'"
                :colspan="getColspan(name)"
              >
                <template v-if="name === 'status'">
                  <book-copy-status-chip :value="bookCopy.status" />
                </template>

                <template v-else-if="name === 'problems'">
                  <chip-button
                    :color="props.row.problems ? 'positive' : 'negative'"
                    :label="
                      t(
                        `manageUsers.booksMovementsDialog.${props.row.problems ? 'solveProblem' : 'reportProblem'}`,
                      )
                    "
                    @click="openProblemDialog(props.row)"
                  />
                </template>

                <template v-else-if="name === 'history'">
                  <q-btn
                    :icon="mdiHistory"
                    color="primary"
                    flat
                    round
                    @click="openHistory(props.row)"
                  />
                </template>

                <template v-else>
                  {{
                    format
                      ? format(getFieldValue(field, bookCopy), props.row)
                      : getFieldValue(field, bookCopy)
                  }}
                </template>
              </q-td>
            </q-tr>
          </template>
        </template>
      </dialog-table>

      <dialog-table
        v-show="isSortedByCopyCode"
        v-model:pagination="copyPagination"
        :columns="columns"
        :loading="copyLoading"
        :rows="copyRows"
        :search-query="searchQuery"
        class="flex-delegate-height-management"
        @request="onCopyRequest"
      >
      </dialog-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiArrowRight,
  mdiChevronDown,
  mdiChevronUp,
  mdiHistory,
  mdiSort,
} from "@quasar/extras/mdi-v7";
import { Dialog, QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import BookCopyStatusChip from "src/components/book-copy-status-chip.vue";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import ProblemsDialog from "src/components/manage-users/problems-dialog.vue";
import ProblemsHistoryDialog from "src/components/manage-users/problems-history-dialog.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import {
  BookCopyFilters,
  BookCopyStatus,
  SchoolFilters,
} from "src/models/book";
import { useAuthService } from "src/services/auth";
import { useBookService } from "src/services/book";
import { useBookCopyService } from "src/services/book-copy";
import {
  BookCopyDetailsFragment,
  ProblemDetailsFragment,
  useReportProblemMutation,
  useResolveProblemMutation,
} from "src/services/book-copy.graphql";
import { BookSummaryFragment } from "src/services/book.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { selectedLocation, retailLocations } = useRetailLocationService();

const isbnPage = ref(0);
const isbnRowsPerPage = ref(100);

const {
  loading: isbnLoading,
  refetchBooks,
  booksPaginationDetails,
} = useBookService(isbnPage, isbnRowsPerPage);

const { useGetBookCopiesQuery } = useBookCopyService();
const {
  loading: copyLoading,
  refetch: refetchBookCopies,
  bookCopies,
} = useGetBookCopiesQuery({
  bookId: "",
});

const { user } = useAuthService();

const { resolveProblem } = useResolveProblemMutation();
const { reportProblem } = useReportProblemMutation();

const { t } = useI18n();

const getFieldValue = <T,>(
  getterOrKey: keyof T | ((row: T) => T[keyof T]),
  object: T,
) =>
  typeof getterOrKey === "function" ? getterOrKey(object) : object[getterOrKey];

const isSortedByCopyCode = ref(false);

const filters = ref<BookCopyFilters[]>();
const schoolFilters = ref<SchoolFilters>();
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

const isbnRows = ref<BookSummaryFragment[]>([]);
const copyRows = ref<BookCopyDetailsFragment[]>([]);

const isbnPagination = ref({
  rowsPerPage: isbnRowsPerPage.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  page: isbnPage.value,
});
const copyPagination = ref({
  rowsPerPage: isbnRowsPerPage.value,
  // FIXME: add correct field once the query supports pagination
  rowsNumber: bookCopies.value.length,
  page: isbnPage.value,
});

type BookCopyDetailsWithStatus = BookCopyDetailsFragment & {
  status: BookCopyStatus;
};

const bodyHeaderCols = computed<QTableColumn<BookCopyDetailsWithStatus>[]>(
  () => [
    {
      name: "code",
      field: "code",
      label: t("book.code"),
    },
    {
      name: "original-code",
      field: "originalCode",
      label: t("book.originalCode"),
      format: (field?: string) => field ?? "/",
    },
    {
      name: "status",
      field: "status",
      label: t("book.fields.status"),
    },
    {
      name: "owner",
      field: ({ owner }) => owner.email,
      label: t("warehouse.owner"),
    },
    {
      name: "problems",
      field: () => undefined,
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

// FIXME: remove stub
const getBookCopies = (bookID: string): BookCopyDetailsWithStatus[] => {
  const book = isbnRows.value.find(({ id }) => id === bookID);
  return [
    {
      book: book
        ? { ...book, retailLocationId: "" }
        : {
            authorsFullName: "",
            id: "",
            isbnCode: "",
            meta: {
              isAvailable: false,
            },
            originalPrice: 0,
            publisherName: "",
            retailLocationId: "",
            subject: "",
            title: "",
          },
      code: "000/000",
      createdAt: 0,
      createdById: "",
      id: "",
      owner: {
        email: "owner@email.com",
        firstname: "",
        id: "",
        lastname: "",
      },
      updatedAt: 0,
      updatedById: "",
      status: BookCopyFilters.SOLD,
    },
  ];
};

const updateTable = (payload: {
  filters: BookCopyFilters[];
  schoolFilters: SchoolFilters;
  searchQuery: string;
}) => {
  filters.value = payload.filters;
  schoolFilters.value = payload.schoolFilters;
  searchQuery.value = payload.searchQuery;
};

const getColspan = (name: string) =>
  name === "original-code" || name === "status" ? 2 : 1;

const onIsbnRequest: QTableProps["onRequest"] = async ({
  pagination: { page, rowsPerPage },
}) => {
  isbnLoading.value = true;

  const newBooks = (
    await refetchBooks({
      page: page - 1,
      rows: rowsPerPage,
      filter: {
        search: searchQuery.value,
      },
    })
  )?.data.books.rows;

  isbnPagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

  isbnRows.value = newBooks ?? isbnRows.value;

  isbnPagination.value.page = page;
  isbnPagination.value.rowsPerPage = rowsPerPage;
  isbnLoading.value = false;
};

const onCopyRequest: QTableProps["onRequest"] = async ({
  pagination: { page, rowsPerPage },
}) => {
  copyLoading.value = true;

  const newBooks = (await refetchBookCopies())?.data.bookCopies;
  copyPagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

  copyRows.value = newBooks ?? copyRows.value;

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

function swapSort() {
  isSortedByCopyCode.value = !isSortedByCopyCode.value;
  searchQuery.value = "";
}

function checkOtherWarehouse() {
  // FIXME: check other warehouse
}

function openProblemDialog(bookCopy: BookCopyDetailsFragment) {
  Dialog.create({
    component: ProblemsDialog,
    componentProps: {
      bookCopy,
      user,
    },
  }).onOk(async ({ solution, details, type }: ProblemDetailsFragment) => {
    if (solution) {
      await resolveProblem({
        input: { id: bookCopy.id, solution },
      });
    } else {
      await reportProblem({
        input: {
          bookCopyId: bookCopy.id,
          details,
          type,
        },
      });
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
