<template>
  <q-page class="catalog-page">
    <span v-if="bookLoading">{{ t("book.loading") }}</span>
    <div v-else class="loaded-wrapper">
      <div v-if="!books.length">{{ t("book.noResult") }}</div>
      <q-card v-else class="catalog-wrapper">
        <div class="catalog-header">
          <q-input
            v-model="searchQuery"
            type="search"
            class="search-bar"
            bg-color="white"
            outlined
            :placeholder="$t('book.search')"
          >
            <template #append>
              <q-icon name="mdi-magnify" />
            </template>
          </q-input>
          <q-select
            v-model="filters"
            fit
            :options="filterOptions"
            class="search-filter"
            bg-color="white"
            outlined
            multiple
          >
            <template #option="{ itemProps, opt, selected, toggleOption }">
              <q-item v-bind="itemProps" class="non-selectable">
                <q-item-section side top>
                  <q-checkbox
                    :model-value="selected"
                    @update:model-value="toggleOption(opt)"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label> {{ filterTranslations[opt] }} </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #after-options>
              <q-item clickable class="non-selectable" @click="openDialog">
                <q-item-section>
                  {{ $t("book.filters.school") }}
                </q-item-section>
              </q-item>
            </template>
            <template #selected>
              {{ $t("book.filter") }}
            </template>
          </q-select>
          <q-btn
            :label="$t('book.addBook')"
            class="add-book-btn q-mx-none"
            color="secondary"
            @click="bookDialog"
          />
        </div>
        <q-table
          :columns="columns"
          :rows="tableRows"
          row-key="name"
          class="book-table"
          :pagination="pagination"
          table-header-class="table-header"
          square
          :filter="{ searchQuery, filters }"
          :filter-method="(rows, terms) => filterRows(terms, rows as Book[])"
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
            <q-td>
              <div class="cell-wrapper">
                <q-chip
                  square
                  :ripple="false"
                  :color="
                    colorFromValue(
                      value,
                      utilityLowThreshold,
                      utilityHighThreshold,
                    )
                  "
                  :dark="
                    colorFromValue(
                      value,
                      utilityLowThreshold,
                      utilityHighThreshold,
                    ) !== 'yellow'
                  "
                  class="utility-chip"
                >
                  {{
                    $t(
                      `book.utility.${
                        colorFromValue(
                          value,
                          utilityLowThreshold,
                          utilityHighThreshold,
                        ) === "red"
                          ? "low"
                          : colorFromValue(
                              value,
                              utilityLowThreshold,
                              utilityHighThreshold,
                            ) === "yellow"
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
import { ComputedRef, computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Book } from "src/@generated/graphql";
import addBookDialog from "src/components/add-book-dialog.vue";
import filterBySchoolDialogVue from "src/components/filter-by-school-dialog.vue";
import { useBookService } from "src/services/book";
import {
  capitalizeFirstLetter,
  formatISBN,
  formatPrice,
} from "../composables/use-misc-formats";
// eslint-disable-next-line @typescript-eslint/unbound-method
const { t, tm, rt } = useI18n();

const currentPage = ref(0),
  numberOfRows = ref(100);

const searchQuery = ref();

const filterTranslations = computed((): string[] => {
  return tm("book.filters.options").map((element) => rt(element));
});

const filterOptions = ref<string[]>(
  /* This creates an array populated with the values ['0', '1', ...] in order
  to have the right amount of options and one unique key for each option */
  Array.apply(null, Array(filterTranslations.value.length)).map(
    (element, index) => index.toString(),
  ),
);

//TODO: Add actual logic with server fetch
const schoolFilterOptions = [
  ["SchoolCode0", "SchoolCode1", "SchoolCode2", "SchoolCode3"],
  ["Address0", "Address1", "Address2", "Address3", "Address4"],
];

const subjects = ["Subject1", "Subject2"];

const filters = ref<string[]>(),
  schoolFilters = ref<string[][]>();

const utilityLowThreshold = ref(0.33),
  utilityHighThreshold = ref(0.66);

const {
  books,
  loading: bookLoading,
  refetchBooks,
} = useBookService(currentPage, numberOfRows, ref<string>());

const tableRows = ref<typeof books.value>();

const columns: ComputedRef<{ name: string; label: string; field: string }[]> =
  computed(() => [
    {
      name: "isbn",
      label: t("book.columns.isbn"),
      field: "isbnCode",
      align: "left",
      format: (value: string) => formatISBN(value),
      sortable: true,
      classes: "small-column ellipsis",
    },
    {
      name: "author",
      label: t("book.columns.author"),
      field: "authorsFullName",
      align: "left",
      format: (val: string) => capitalizeFirstLetter(val),
      sortable: true,
      classes: "small-column ellipsis",
    },
    {
      name: "publisher",
      label: t("book.columns.publisher"),
      field: "publisherName",
      align: "left",
      format: (val: string) => capitalizeFirstLetter(val),
      sortable: true,
      classes: "small-column ellipsis",
    },
    {
      name: "subject",
      label: t("book.columns.subject"),
      field: "subject",
      align: "left",
      format: (val: string) => capitalizeFirstLetter(val),
      sortable: true,
      classes: "small-column ellipsis",
    },
    {
      name: "title",
      label: t("book.columns.title"),
      field: "title",
      align: "left",
      format: (val: string) => capitalizeFirstLetter(val),
      sortable: true,
      classes: "large-column ellipsis",
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

onMounted(() => {
  refetchBooks()
    ?.then(() => {
      tableRows.value = books.value;
    })
    .catch((error) => {
      console.error("Something went wrong: ", error);
    });
});

function colorFromValue(
  value: string,
  utilityLowThreshold: number,
  utilityHighThreshold: number,
): string {
  return parseFloat(value) < utilityLowThreshold
    ? "red"
    : parseFloat(value) < utilityHighThreshold
    ? "yellow"
    : "green";
}

function openDialog() {
  Dialog.create({
    component: filterBySchoolDialogVue,
    componentProps: {
      filters: schoolFilterOptions,
      selectedFilters: schoolFilters.value,
    },
  }).onOk((payload: string[][]) => {
    schoolFilters.value = cloneDeep(payload);
  });
}

function filterRows(
  terms: { searchQuery?: string; filters?: string[] },
  rows?: Book[],
) {
  const filteredRows = ref<Book[]>([]);

  if (rows) {
    for (const row of rows) {
      let field: keyof Book;
      for (field in row) {
        if (
          field !== "__typename" &&
          field !== "id" &&
          field !== "retailLocation" &&
          field !== "retailLocationId" &&
          row[field]
            .toString()
            .toLowerCase()
            .includes(terms.searchQuery?.toLowerCase() ?? "")
        ) {
          filteredRows.value.push(row);
          break;
        }
      }
      if (filters.value) {
        for (const filter of filters.value) {
          //TODO: Insert actual logic once the Book fields are updated
          if (Math.floor(parseInt(filter) / 3)) {
            filteredRows.value.pop();
            break;
          }
        }
      }
      // TODO: Add checks for school filters
    }
  }

  return terms.filters?.length ?? terms.searchQuery
    ? filteredRows.value
    : rows ?? Array<Book[]>([]);
}

function bookDialog() {
  Dialog.create({
    component: addBookDialog,
    componentProps: {
      titles: columns.value
        .slice(0, columns.value.length - 2)
        .map((element) => element.label),
      subjects,
    },
  }).onOk((payload: string[]) => {
    payload; // TODO: Load the new book in the database with the data passed from the dialog
  });
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
  overflow: hidden;
}

:deep(.large-column) {
  max-width: 566px;
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
