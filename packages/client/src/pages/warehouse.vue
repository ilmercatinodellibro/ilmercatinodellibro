<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters
        v-model="tableFilter"
        :filter-options="filterOptions"
        :search-input-placeholder="t('warehouse.searchPlaceholder')"
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
        v-model:pagination="pagination"
        :columns="booksColumns"
        :filter="tableFilter"
        :loading="isLoading"
        :rows="bookRows"
        class="flex-delegate-height-management"
        row-key="id"
        @request="fetchBooksPage"
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
              v-for="{ name, field, align, classes } in booksColumns"
              :key="name"
              :class="[align ? `text-${align}` : 'text-left', classes]"
              :colspan="name === 'title' ? 2 : 1"
              auto-width
            >
              <status-chip
                v-if="name === 'status'"
                :value="props.row.meta.isAvailable"
              />

              <span
                v-else-if="name === 'available-copies'"
                class="cursor-pointer text-underline"
              >
                {{ getFieldValue(field, props.row) }}

                <q-tooltip class="white-space-pre-wrap">
                  {{
                    $t("warehouse.availabilityTooltip", {
                      copiesCount: props.row.meta.copiesCount,
                      problemsCount: props.row.meta.problemsCount,
                      soldCount: props.row.meta.soldCount,
                      reservationsCount: props.row.meta.reservationsCount,
                      cartItemsCount: props.row.meta.cartItemsCount,
                    })
                  }}
                </q-tooltip>
              </span>

              <span v-else>
                <q-tooltip v-if="['subject', 'author'].includes(name)">
                  {{ getFieldValue(field, props.row) }}
                </q-tooltip>
                {{ getFieldValue(field, props.row) }}
              </span>
            </q-td>
          </q-tr>

          <template v-if="props.expand">
            <book-copy-details-row
              :book-copy-columns="bookCopyColumns"
              :book-id="props.row.id"
              :show-only-available="booleanFilters?.isAvailable"
              @open-history="(bookCopy) => openHistory(bookCopy)"
              @update-problems="fetchBooks(pagination)"
            />
          </template>
        </template>
      </dialog-table>

      <dialog-table
        v-else
        v-model:pagination="pagination"
        :columns="bookCopyColumns"
        :filter="tableFilter"
        :loading="isLoading"
        :rows="bookCopiesRows"
        class="col"
        @request="fetchBooksPage"
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
            <problems-button
              :book-copy="row"
              @update-problems="fetchBooks(pagination)"
            />
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
import { Dialog, QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import BookCopyDetailsRow from "src/components/book-copy-details-row.vue";
import BookCopyStatusChip from "src/components/book-copy-status-chip.vue";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import ProblemsHistoryDialog from "src/components/manage-users/problems-history-dialog.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import TableCellWithTooltip from "src/components/manage-users/table-cell-with-tooltip.vue";
import ProblemsButton from "src/components/problems-button.vue";
import { useTableFilters } from "src/composables/use-table-filters";
import { notifyError } from "src/helpers/error-messages";
import { getFieldValue } from "src/helpers/table-helpers";
import { fetchBooksWithCopies } from "src/services/book";
import { fetchBooksCopies } from "src/services/book-copy";
import {
  BookCopyDetailsFragment,
  PaginatedBookCopyResultFragment,
} from "src/services/book-copy.graphql";
import {
  BookSummaryFragment,
  PaginatedBookResultFragment,
} from "src/services/book.graphql";

interface WarehousePagination {
  page: number;
  rowsPerPage: number;
  // This must be set, even if with just value 0, to enable server side
  // pagination and automatic requests via @request event when the filter changes
  rowsNumber: number;
}

const isSortedByCopyCode = ref(true);

const { refetchFilterProxy, filterOptions, tableFilter, booleanFilters } =
  useTableFilters("warehouse.filters", true);

const paginatedBooksWithCopies = ref<PaginatedBookResultFragment>();
// Avoids errors in the template while books haven't been fetched yet or are loading
const bookRows = computed(() => paginatedBooksWithCopies.value?.rows ?? []);

const paginatedBookCopies = ref<PaginatedBookCopyResultFragment>();
// Avoids errors in the template while books copies haven't been fetched yet or are loading
const bookCopiesRows = computed(() => paginatedBookCopies.value?.rows ?? []);

const pagination = ref<WarehousePagination>({
  page: 1,
  rowsPerPage: 30,
  rowsNumber: 0,
});

const isLoading = ref(false);

async function fetchBooks({
  page,
  rowsPerPage,
}: Omit<WarehousePagination, "rowsNumber">) {
  if (refetchFilterProxy.value.search.length < 3) {
    paginatedBooksWithCopies.value = undefined;
    paginatedBookCopies.value = undefined;

    pagination.value.rowsNumber = 0;
    return;
  }

  const fetchBooks = isSortedByCopyCode.value
    ? fetchBooksCopies
    : fetchBooksWithCopies;

  isLoading.value = true;

  try {
    // TODO: implement aborting requests on subsequent calls
    const result = await fetchBooks({
      page: page - 1,
      rows: rowsPerPage,
      filter: refetchFilterProxy.value,
    });

    switch (result.__typename) {
      case "BookQueryResult":
        paginatedBooksWithCopies.value = result;
        break;
      case "PaginatedBookCopyQueryResult":
        paginatedBookCopies.value = result;
        break;
    }

    pagination.value.rowsNumber = result.rowsCount;
  } catch (error) {
    notifyError(t("bookErrors.warehouseFetchFailed"));
    throw error;
  } finally {
    isLoading.value = false;
  }
}

const fetchBooksPage: Exclude<QTableProps["onRequest"], undefined> = async ({
  pagination: { page, rowsPerPage },
}) => {
  await fetchBooks({ page, rowsPerPage });

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
};

async function swapView() {
  isSortedByCopyCode.value = !isSortedByCopyCode.value;
  pagination.value.page = 1;

  paginatedBooksWithCopies.value = undefined;
  paginatedBookCopies.value = undefined;

  await fetchBooks(pagination.value);
}

const { t } = useI18n();

const booksColumns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
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
    field: ({ meta }) => meta.availableCount,
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

function openHistory(bookCopy: BookCopyDetailsFragment) {
  Dialog.create({
    component: ProblemsHistoryDialog,
    componentProps: {
      bookCopy,
    },
  });
}
</script>
