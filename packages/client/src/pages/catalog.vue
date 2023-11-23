<template>
  <q-page class="catalog-page">
    <span v-if="bookLoading">{{ t("book.loading") }}</span>
    <div v-else class="loaded-wrapper">
      <div v-if="!books.length">{{ t("book.noResult") }}</div>
      <q-card v-else class="catalog-wrapper">
        <div class="catalog-header">
          <q-input
            type="search"
            :model-value="searchQuery"
            class="search-bar"
            bg-color="white"
            square
            outlined
            :placeholder="$t('book.search')"
          />
          <q-select
            :model-value="filters"
            class="search-filter"
            bg-color="white"
            square
            outlined
            :label="$t('book.filter')"
          />
          <q-btn
            color="secondary"
            :label="$t('book.addBook')"
            class="add-book-btn q-mx-none"
          />
        </div>
        <q-table
          :columns="columns"
          :rows="rows"
          row-key="name"
          class="book-table"
          :pagination="pagination"
          table-header-class="table-header"
          square
        >
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
            <q-td>
              <div class="cell-wrapper">
                <q-chip
                  square
                  :ripple="false"
                  :color="colorFromValue(value)"
                  :dark="colorFromValue(value) !== 'yellow'"
                  class="utility-chip"
                >
                  {{
                    $t(
                      `book.utility.${
                        colorFromValue(value) === "red"
                          ? "low"
                          : colorFromValue(value) === "yellow"
                          ? "medium"
                          : "high"
                      }`,
                    )
                  }}
                </q-chip>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ComputedRef, Ref, computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBookService } from "src/services/book";
const { t } = useI18n();

const currentPage = ref(0);
const numberOfRows = ref(100);
const searchQuery = ref("");
const filters = ref("");

const utilityLowThreshold = ref(0.33);
const utilityHighThreshold = ref(0.66);

const {
  books,
  loading: bookLoading,
  loadBooksMutation,
} = useBookService(currentPage, numberOfRows);

const rows: Ref<typeof books.value> = ref([]);

const columns: ComputedRef<
  { name: string; label: string; field: string; align: "left" }[]
> = computed(() => [
  {
    name: "isbn",
    label: t("book.columns.isbn"),
    field: "isbnCode",
    align: "left",
    format: (value: string) => formatISBN(value),
    sortable: true,
    classes: "small-column",
  },
  {
    name: "author",
    label: t("book.columns.author"),
    field: "authorsFullName",
    align: "left",
    format: (val: string) => capitalizeFirstLetter(val),
    sortable: true,
    classes: "small-column",
  },
  {
    name: "publisher",
    label: t("book.columns.publisher"),
    field: "publisherName",
    align: "left",
    format: (val: string) => capitalizeFirstLetter(val),
    sortable: true,
    classes: "small-column",
  },
  {
    name: "subject",
    label: t("book.columns.subject"),
    field: "subject",
    align: "left",
    format: (val: string) => capitalizeFirstLetter(val),
    sortable: true,
    classes: "small-column",
  },
  {
    name: "title",
    label: t("book.columns.title"),
    field: "title",
    align: "left",
    format: (val: string) => capitalizeFirstLetter(val),
    sortable: true,
    classes: "large-column",
  },
  {
    name: "price",
    label: t("book.columns.price"),
    field: "originalPrice",
    align: "left",
    format: (val: string) => formatPrice(val),
    sortable: true,
  },
  {
    name: "status",
    label: t("book.columns.status"),
    //TODO: add the field name
    field: "",
    align: "left",
    sortable: true,
  },
  {
    name: "utility",
    label: t("book.columns.utility"),
    //TODO: add the field name
    field: "",
    align: "left",
    sortable: true,
    classes: "x-small-column",
  },
]);

const pagination = computed(() => {
  return { rowsPerPage: numberOfRows.value };
});

async function loadBooks() {
  await loadBooksMutation.loadBooksIntoDatabase();
}

onMounted(() => {
  loadBooks()
    .then(() => {
      rows.value = books.value;
    })
    .catch(() => {
      console.error("Something went wrong");
    });
});

function capitalizeFirstLetter(text: string) {
  return text
    .split(" ")
    .map((word: string) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function formatPrice(price: string): string {
  return parseFloat(price).toFixed(2).toLocaleString() + " €";
}

function formatISBN(isbnCode: string): string {
  return [
    isbnCode.slice(0, 3),
    isbnCode.slice(3, 5),
    isbnCode.slice(5, 10),
    isbnCode.slice(10, 12),
    isbnCode.slice(12, 13),
  ].join("-");
}

function colorFromValue(value: string): string {
  return parseFloat(value) < utilityLowThreshold.value
    ? "red"
    : parseFloat(value) < utilityHighThreshold.value
    ? "yellow"
    : "green";
}
</script>

<style scoped lang="scss">
.catalog {
  &-page {
    padding: 16px;
    display: flex;
    align-items: center;
    height: calc(100vh - 64px);
  }

  &-header {
    align-items: center;
    display: flex;
    gap: 16px;
    padding: 16px;
    width: 100%;
  }

  &-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
  }
}

.loaded-wrapper {
  width: 100%;
  height: 100%;
}

.search-bar {
  max-width: 600px;
  width: 100%;
  height: 56px;
}

.search-filter {
  width: 200px;
  height: 56px;
}

.book-table {
  height: calc(100% - 92px);
}

.add-book-btn {
  margin-right: 10px;
  margin-left: auto;
  height: min-content;
}

:deep(.utility-chip) {
  text-transform: uppercase;
  font-size: 14px;
  line-height: 16px;
  user-select: none;
}

:deep(.cell-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

:deep(.small-column) {
  max-width: 160px;
  text-overflow: ellipsis;
  overflow: hidden;
}

:deep(.large-column) {
  max-width: 566px;
  text-overflow: ellipsis;
  overflow: hidden;
}

:deep(.x-small-column) {
  max-width: 90px;
}

:deep(thead) {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #fff;
}
</style>
