<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters @filter="updateTable">
        <template #side-actions>
          <q-btn
            :icon="mdiSort"
            :label="t('warehouse.sortByCopyCode')"
            no-wrap
            outline
            @click="sortByCopyCode()"
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
        v-model:pagination="pagination"
        :columns="columns"
        :loading="loading"
        :rows="rows"
        :search-query="searchQuery"
        class="flex-delegate-height-management"
        @request="onRequest"
      >
        <template #header="props">
          <q-tr :props="props">
            <q-th auto-width />
            <q-th
              v-for="{ name, label } in props.cols"
              :key="name"
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
                @click="() => (props.expand = !props.expand)"
              />
            </q-td>

            <q-td
              v-for="{ name, field } in filteredColumns"
              :key="name"
              :colspan="name === 'title' ? 2 : 1"
              auto-width
            >
              <template v-if="name === 'status'">
                <status-chip :value="props.row.status" />
              </template>
              <template v-else>
                {{ getFieldValue(field, props.row) }}
              </template>
            </q-td>
          </q-tr>

          <template v-if="props.expand">
            <q-tr no-hover>
              <q-th auto-width />

              <q-th
                v-for="{ name, label } in bodyHeaderCols"
                :key="name"
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
              >
                {{
                  format
                    ? format(getFieldValue(field, bookCopy), props.row)
                    : getFieldValue(field, bookCopy)
                }}
              </q-td>
            </q-tr>
          </template>
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
  mdiSort,
} from "@quasar/extras/mdi-v7";
import { QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import { BookCopyFilters, SchoolFilters } from "src/models/book";
import { useBookService } from "src/services/book";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";
import { BookSummaryFragment } from "src/services/book.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { selectedLocation, retailLocations } = useRetailLocationService();

const page = ref(0);
const rowsPerPage = ref(100);

const { loading, refetchBooks, booksPaginationDetails } = useBookService(
  page,
  rowsPerPage,
);

const getFieldValue = <T,>(
  getterOrKey: keyof T | ((row: T) => T[keyof T]),
  object: T,
) =>
  typeof getterOrKey === "function" ? getterOrKey(object) : object[getterOrKey];

const { t } = useI18n();

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
  {
    name: "history",
    field: () => undefined,
    label: "",
  },
]);

const filteredColumns = computed(() =>
  columns.value.filter(({ name }: QTableColumn) => name !== "problems"),
);

const rows = ref<BookSummaryFragment[]>([]);

const pagination = ref({
  rowsPerPage: rowsPerPage.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  page: page.value,
});

const enum BookCopyStatuses {
  LOST = "lost",
  RETURNED = "returned",
  DONATED = "donated",
  INCOMPLETE = "incomplete",
  NOT_AVAILABLE = "not-available",
}

type BookCopyDetailsWithStatus = BookCopyDetailsFragment & {
  status: BookCopyFilters | BookCopyStatuses;
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
    },
    {
      name: "history",
      field: () => undefined,
      label: "",
    },
  ],
);

// FIXME: remove stub
const getBookCopies: (bookID: string) => BookCopyDetailsWithStatus[] = (
  bookID,
) => [
  {
    book: {
      title: "",
      authorsFullName: "",
      id: "",
      originalPrice: 0,
      meta: {
        isAvailable: false,
      },
      subject: "",
      isbnCode: "",
      publisherName: "",
      retailLocationId: "",
    },
    code: bookID,
    createdAt: 0,
    createdById: "",
    id: "",
    owner: {
      email: "",
      firstname: "",
      id: "",
      lastname: "",
    },
    updatedAt: 0,
    updatedById: "",
    status: BookCopyStatuses.DONATED,
  },
];

const updateTable = (payload: {
  filters: BookCopyFilters[];
  schoolFilters: SchoolFilters;
  searchQuery: string;
}) => {
  filters.value = payload.filters;
  schoolFilters.value = payload.schoolFilters;
  searchQuery.value = payload.searchQuery;
};

const onRequest: QTableProps["onRequest"] = async (requestProps) => {
  loading.value = true;

  const newBooks = await refetchBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
  });
  pagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

  rows.value = newBooks?.data.books.rows ?? rows.value;

  pagination.value.page = requestProps.pagination.page;
  pagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;
  loading.value = false;
};

// We know that there are only two retail locations in the array,
// so we filter out the currently selected one
const otherCityName = computed(
  () =>
    retailLocations.value.filter(
      (location) => location.id !== selectedLocation.value.id,
    )[0]?.name,
);

function sortByCopyCode() {
  // FIXME: sort book copies by code
}

function checkOtherWarehouse() {
  // FIXME: check other warehouse
}
</script>
