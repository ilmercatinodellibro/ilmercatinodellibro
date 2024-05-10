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
              v-for="{ name, field, align } in columns"
              :key="name"
              :class="align ? `text-${align}` : 'text-left'"
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
                  {{ getFieldValue(field, props.row) }}
                </span>
              </template>
            </q-td>
          </q-tr>

          <template v-if="props.expand">
            <book-copy-details-table
              :book-copy-columns="bookCopyColumns"
              :book-id="props.row.id"
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
        :rows="
          // FIXME: bookCopies don't have the status field but the columns specify it
          bookCopies.rows
        "
        class="flex-delegate-height-management"
        @request="onCopyRequest"
      >
        <template #body-cell-status="{ row }">
          <q-td>
            <book-copy-status-chip :book-copy="row" />
          </q-td>
        </template>

        <template #body-cell-problems="{ row }">
          <q-td>
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
  mdiArrowRight,
  mdiChevronDown,
  mdiChevronUp,
  mdiDotsVertical,
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
import ProblemsButton from "src/components/problems-button.vue";
import { useTableFilters } from "src/composables/use-table-filters";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
import { getFieldValue } from "src/helpers/table-helpers";
import {
  BookCopyDetailsFragment,
  useGetPaginatedBookCopiesQuery,
} from "src/services/book-copy.graphql";
import { useGetBooksWithAvailableCopiesQuery } from "src/services/book.graphql";
import { BookWithAvailableCopiesFragment } from "src/services/cart.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { selectedLocation, retailLocations } = useRetailLocationService();

const booksPage = ref(0);
const copyPage = ref(0);

const booksPerPage = ref(100);
const bookCopiesPerPage = ref(100);

const {
  books,
  refetch: refetchBooks,
  loading: booksLoading,
} = useGetBooksWithAvailableCopiesQuery({
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

// Setting this so that the side buttons don't overflow to two rows when the screen
// is below the minimum width to hold them in a single row
const smallScreenBreakpoint = 1694;
const screenWidth = useScreenWidth(smallScreenBreakpoint);

const isSortedByCopyCode = ref(false);

const tableRef = ref<QTable>();

const { refetchFilterProxy, filterOptions, tableFilter, updateFilters } =
  useTableFilters("warehouse.filters");

// As I can understand this filter isn't actually used BUT by passing our filters to the QTable
// allows the component to throw the "@request" event which is used to refetch our data
const filterMethod: QTableProps["filterMethod"] = (rows) => {
  return rows as BookWithAvailableCopiesFragment[];
};

const columns = computed<QTableColumn<BookWithAvailableCopiesFragment>[]>(
  () => [
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
      field: ({ copies }) => copies?.length ?? 0,
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
  ],
);

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
      name: "author",
      field: ({ book }) => book.authorsFullName,
      label: t("book.fields.author"),
      align: "left",
    },
    {
      name: "subject",
      field: ({ book }) => book.subject,
      label: t("book.fields.subject"),
      align: "left",
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
  await refetchBooks({
    retailLocationId: selectedLocation.value.id,
    page: page - 1,
    rows: rowsPerPage,
    filter: refetchFilterProxy.value,
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

function checkOtherWarehouse() {
  // FIXME: check other warehouse
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
