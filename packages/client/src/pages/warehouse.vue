<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters
        v-model="tableFilter"
        :filter-options="filterOptions"
      >
        <template #side-actions>
          <q-btn color="black-12" no-wrap outline @click="swapView()">
            <q-item-section class="q-pl-none q-pr-sm text-black-87" side>
              <q-icon :name="mdiSort" />
            </q-item-section>
            <q-item-section class="text-black-87">
              {{
                t(
                  `warehouse.${isSortedByCopyCode ? "sortByISBN" : "sortByCopyCode"}`,
                )
              }}
            </q-item-section>
          </q-btn>
        </template>

        <!-- TODO: add a button to check the other warehouse out -->
      </header-search-bar-filters>

      <dialog-table
        v-if="!isSortedByCopyCode"
        ref="tableRef"
        v-model:pagination="booksPagination"
        :columns="columns"
        :filter="tableFilter"
        :filter-method="filterMethod"
        :loading="booksLoading"
        :rows="books?.rows ?? []"
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
              v-for="{ name, field, align, classes } in columns"
              :key="name"
              :class="[align ? `text-${align}` : 'text-left', classes]"
              :colspan="name === 'title' ? 2 : 1"
              auto-width
            >
              <template v-if="name === 'status'">
                <status-chip :value="props.row.meta.isAvailable" />
              </template>

              <template v-else>
                <span
                  :class="{
                    'text-underline': name === 'available-copies',
                  }"
                >
                  <q-tooltip v-if="['subject', 'author'].includes(name)">
                    {{ getFieldValue(field, props.row) }}
                  </q-tooltip>
                  {{ getFieldValue(field, props.row) }}
                </span>
              </template>
            </q-td>
          </q-tr>

          <template v-if="props.expand">
            <book-copy-details-table
              :book-copy-columns="bookCopyColumns"
              :book-id="props.row.id"
              :show-only-available="booleanFilters?.isAvailable"
              @open-history="(bookCopy) => openHistory(bookCopy)"
              @update-problems="refetchBooks()"
            />
          </template>
        </template>
      </dialog-table>

      <dialog-table
        v-else-if="bookCopies"
        v-model:pagination="copyPagination"
        :columns="bookCopyColumns"
        :filter="tableFilter"
        :filter-method="filterMethod"
        :loading="copyLoading"
        :rows="bookCopies.rows"
        class="col"
        @request="onCopyRequest"
      >
        <template #body-cell-author="{ col, value }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>
        <template #body-cell-subject="{ col, value }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>
        <template #body-cell-owner="{ col, value }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>

        <template #body-cell-status="{ row }">
          <q-td>
            <book-copy-status-chip :book-copy="row" />
          </q-td>
        </template>

        <template #body-cell-problems="{ col, row }">
          <q-td :class="[`text-${col.align ?? 'left'}`, col.classes]">
            <problems-button :book-copy="row" />
          </q-td>
        </template>

        <template #body-cell-history="{ row }">
          <q-td>
            <q-btn
              :icon="mdiHistory"
              color="primary"
              flat
              round
              @click="openHistory(row)"
            />
          </q-td>
        </template>
      </dialog-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiHistory,
  mdiSort,
} from "@quasar/extras/mdi-v7";
import { Dialog, QTable, QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import BookCopyDetailsTable from "src/components/book-copy-details-table.vue";
import BookCopyStatusChip from "src/components/book-copy-status-chip.vue";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import ProblemsHistoryDialog from "src/components/manage-users/problems-history-dialog.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import TableCellWithTooltip from "src/components/manage-users/table-cell-with-tooltip.vue";
import ProblemsButton from "src/components/problems-button.vue";
import { useTableFilters } from "src/composables/use-table-filters";
import { isAvailable } from "src/helpers/book-copy";
import { getFieldValue } from "src/helpers/table-helpers";
import {
  BookCopyDetailsFragment,
  useGetPaginatedBookCopiesQuery,
} from "src/services/book-copy.graphql";
import {
  BookWithCopiesInStockFragment,
  useGetBooksWithCopiesInStockQuery,
} from "src/services/book.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { selectedLocation } = useRetailLocationService();

const booksPage = ref(0);
const copyPage = ref(0);

const booksPerPage = ref(100);
const bookCopiesPerPage = ref(100);

const {
  books,
  refetch: refetchBooks,
  loading: booksLoading,
} = useGetBooksWithCopiesInStockQuery({
  page: booksPage.value,
  retailLocationId: selectedLocation.value.id,
  rows: booksPerPage.value,
});

const {
  paginatedBookCopies: bookCopies,
  loading: copyLoading,
  refetch: refetchBookCopies,
} = useGetPaginatedBookCopiesQuery({
  page: copyPage.value,
  retailLocationId: selectedLocation.value.id,
  rows: bookCopiesPerPage.value,
});

const { t } = useI18n();

const isSortedByCopyCode = ref(true);

const tableRef = ref<QTable>();

const {
  refetchFilterProxy,
  filterOptions,
  tableFilter,
  filterMethod,
  booleanFilters,
} = useTableFilters("warehouse.filters", true);

const columns = computed<QTableColumn<BookWithCopiesInStockFragment>[]>(() => [
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
    classes: "max-width-160 ellipsis",
  },
  {
    name: "subject",
    field: "subject",
    label: t("book.fields.subject"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "status",
    field: ({ meta }) => meta.isAvailable,
    label: t("book.fields.status"),
    align: "left",
  },
  {
    name: "available-copies",
    field: ({ copies }) =>
      copies?.filter((copy) => isAvailable(copy)).length ?? 0,
    label: t("reserveBooks.availableCopies"),
    align: "center",
  },
  {
    name: "title",
    field: "title",
    label: t("book.fields.title"),
    align: "left",
    classes: "text-wrap",
  },
  {
    name: "problems",
    field: () => undefined,
    label: "",
    align: "center",
  },
]);

const booksPagination = ref({
  rowsPerPage: booksPerPage.value,
  rowsNumber: books.value?.rowsCount,
  page: booksPage.value,
});
const copyPagination = ref({
  rowsPerPage: bookCopiesPerPage.value,
  rowsNumber: bookCopies.value?.rowsCount,
  page: copyPage.value,
});

const bookCopyColumns = computed<QTableColumn<BookCopyDetailsFragment>[]>(
  () => [
    {
      name: "code",
      field: "code",
      label: t("book.code"),
      align: "left",
    },
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
      classes: "ellipsis max-width-160",
    },
    {
      name: "subject",
      field: ({ book }) => book.subject,
      label: t("book.fields.subject"),
      align: "left",
      classes: "ellipsis max-width-160",
    },
    {
      name: "status",
      field: () => undefined,
      label: t("book.fields.status"),
      align: "left",
    },
    {
      name: "title",
      field: ({ book }) => book.title,
      label: t("book.fields.title"),
      align: "left",
      classes: "text-wrap",
    },
    {
      name: "owner",
      field: ({ owner }) => owner.email,
      label: t("warehouse.owner"),
      align: "left",
      classes: "max-width-160 ellipsis",
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
  await refetchBooks({
    retailLocationId: selectedLocation.value.id,
    page: page - 1,
    rows: rowsPerPage,
    filter: { ...refetchFilterProxy.value },
  });

  booksPagination.value.rowsNumber = books.value?.rowsCount;

  booksPagination.value.page = page;
  booksPagination.value.rowsPerPage = rowsPerPage;
  booksLoading.value = false;
};

const onCopyRequest: QTableProps["onRequest"] = async ({
  pagination: { page, rowsPerPage },
}) => {
  await refetchBookCopies({
    retailLocationId: selectedLocation.value.id,
    page: page - 1,
    rows: rowsPerPage,
    filter: refetchFilterProxy.value,
  });

  copyPagination.value.rowsNumber = bookCopies.value?.rowsCount;

  copyPagination.value.page = page;
  copyPagination.value.rowsPerPage = rowsPerPage;
  copyLoading.value = false;
};

function swapView() {
  isSortedByCopyCode.value = !isSortedByCopyCode.value;

  tableFilter.searchQuery = "";
  tableFilter.filters = [];
  tableFilter.schoolFilters = {
    selectedSchoolCourseIds: [],
    selectedSchoolCodes: [],
  };

  if (isSortedByCopyCode.value) {
    copyPage.value = 0;
  } else {
    booksPage.value = 0;
  }
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
