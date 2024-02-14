<template>
  <q-dialog ref="dialogRef" full-width full-height @hide="onDialogHide">
    <k-dialog-card
      :title="
        $t('manageUsers.checkOutUserDialog.title', [
          user.firstname,
          user.lastname,
        ])
      "
    >
      <q-card-section class="gap-16 items-center no-wrap q-pa-md row">
        <q-input
          v-model="totalSoldBooks"
          :label="$t('manageUsers.checkOutUserDialog.soldBooksCountLabel')"
          outlined
          readonly
        />
        <q-input
          :label="$t('manageUsers.checkOutUserDialog.totalCheckOutLabel')"
          :model-value="totalCheckoutMoney.toFixed(2)"
          outlined
          readonly
          suffix="€"
        />
        <q-input
          :label="$t('manageUsers.checkOutUserDialog.totalCheckedOutLabel')"
          :model-value="totalCheckedOutMoney.toFixed(2)"
          outlined
          readonly
          suffix="€"
        />
        <q-space />
        <q-icon :name="mdiInformationOutline" color="black-54" size="24px" />
        {{ $t("manageUsers.checkOutUserDialog.info") }}
      </q-card-section>

      <q-card-section class="col-grow column height-0 no-wrap q-pa-none">
        <dialog-table
          :columns="columns"
          :loading="bookLoading"
          :pagination="pagination"
          :rows="tableRows"
          :rows-per-page-options="[0]"
          hide-bottom
        >
          <template #header-cell-buy-price>
            <table-header-with-info
              :info="$t('manageUsers.checkOutUserDialog.buyPriceTooltip')"
              :label="$t('manageUsers.checkOutUserDialog.buyPrice')"
            />
          </template>
          <template #header-cell-public-price>
            <table-header-with-info
              :info="$t('manageUsers.checkOutUserDialog.publicPriceTooltip')"
              :label="$t('manageUsers.checkOutUserDialog.publicPrice')"
            />
          </template>

          <!-- Body slot is used because we need to split the table into 3 parts -->
          <template #body="{ row, cols }">
            <q-tr
              v-if="Object.values(Titles).includes(row.id)"
              class="bg-grey-1"
              no-hover
            >
              <q-td>
                <q-checkbox
                  v-if="row.id === Titles.InStock"
                  :model-value="rowsSelectionStatus"
                  dense
                  @update:model-value="swapAllRows()"
                />
              </q-td>
              <!--
                This <td> takes all the remaining columns of the table's worth of width
                so the colspan is set to take up the space of all the other columns
              -->
              <q-td class="non-selectable text-weight-medium" colspan="11">
                <span class="items-center row">
                  {{ localizedSectionTitle(row.id) }}
                  <q-space />
                  <span
                    v-if="
                      rowsSelectionStatus !== false && row.id === Titles.InStock
                    "
                    class="gap-16 items-center row sticky-button-group"
                  >
                    <q-btn
                      :label="
                        $t(
                          'manageUsers.checkOutUserDialog.returnOptions.donate',
                        )
                      "
                      outline
                      @click="donateBooks(selectedRowsIDs)"
                    />
                    <q-btn
                      :label="
                        $t('manageUsers.checkOutUserDialog.returnOptions.repay')
                      "
                      outline
                      @click="repayBooks(selectedRowsIDs)"
                    />
                    <q-btn
                      :label="
                        $t(
                          'manageUsers.checkOutUserDialog.returnOptions.return',
                        )
                      "
                      color="positive"
                      @click="returnBooks(selectedRowsIDs)"
                    />
                    <q-btn
                      :label="
                        $t('manageUsers.booksMovementsDialog.reportProblem')
                      "
                      color="negative"
                      @click="reportProblems(selectedRowsIDs)"
                    />
                  </span>
                </span>
              </q-td>
            </q-tr>

            <q-tr v-else>
              <q-td v-for="col in cols" :key="col.name">
                <!--
                  Since we can't use #body-cell-[column-name] because we're using
                  the #body slot, we have to use v-if on the col.name instead
                -->
                <q-checkbox
                  v-if="
                    col.name === 'select' && selectableRowsIDs.includes(row.id)
                  "
                  :model-value="selectedRowsIDs.includes(row.id)"
                  dense
                  @update:model-value="swapRow(row.id)"
                />
                <q-btn
                  v-else-if="col.name === 'actions' && stockRows.includes(row)"
                  :icon="mdiDotsVertical"
                  dense
                  flat
                  round
                  size="sm"
                >
                  <q-menu auto-close>
                    <q-item
                      class="items-center"
                      clickable
                      @click="returnBooks([row.id])"
                    >
                      {{
                        $t(
                          "manageUsers.checkOutUserDialog.returnOptions.return",
                        )
                      }}
                    </q-item>
                    <q-item
                      class="items-center"
                      clickable
                      @click="donateBooks([row.id])"
                    >
                      {{
                        $t(
                          "manageUsers.checkOutUserDialog.returnOptions.donate",
                        )
                      }}
                    </q-item>
                    <q-item
                      class="items-center"
                      clickable
                      @click="repayBooks([row.id])"
                    >
                      {{
                        $t("manageUsers.checkOutUserDialog.returnOptions.repay")
                      }}
                    </q-item>
                    <q-item
                      class="items-center"
                      clickable
                      @click="reportProblems([row.id])"
                    >
                      {{ $t("manageUsers.booksMovementsDialog.reportProblem") }}
                    </q-item>
                  </q-menu>
                </q-btn>
                <span v-else>
                  {{ col.value }}
                </span>
              </q-td>
            </q-tr>
          </template>
        </dialog-table>
      </q-card-section>
      <template #card-actions>
        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />
        <q-btn
          outline
          :label="$t('manageUsers.checkOutUserDialog.returnAndDonate')"
          @click="onDialogOK('return-and-donate')"
        />
        <q-btn
          color="green"
          :label="$t('manageUsers.checkOutUserDialog.returnEverything')"
          @click="onDialogOK('return-everything')"
        />
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiDotsVertical, mdiInformationOutline } from "@quasar/extras/mdi-v7";
import { cloneDeep } from "lodash-es";
import {
  QDialog,
  QTableColumn,
  QTableProps,
  useDialogPluginComponent,
} from "quasar";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import KDialogCard from "src/components/k-dialog-card.vue";
import { UserSummaryFragment } from "src/services/auth.graphql";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";
import DialogTable from "./dialog-table.vue";
import TableHeaderWithInfo from "./table-header-with-info.vue";

const { t } = useI18n();

defineProps<{
  user: UserSummaryFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent<"return-and-donate" | "return-everything">();

const totalSoldBooks = ref(0);
const totalCheckoutMoney = ref(0);
const totalCheckedOutMoney = ref(0);

const columns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    name: "select",
    field: () => undefined,
    label: "",
  },
  {
    name: "isbn-code",
    field: "isbnCode",
    label: t("book.fields.isbn"),
    align: "left",
  },
  {
    name: "book-code",
    // FIXME: add field
    field: () => undefined,
    label: t("book.code"),
    align: "left",
  },
  {
    name: "status",
    // FIXME: add field
    field: () => undefined,
    label: t("book.fields.status"),
  },
  {
    name: "author",
    field: "authorsFullName",
    label: t("book.fields.author"),
    align: "left",
  },
  {
    name: "publisher",
    field: "publisherName",
    label: t("book.fields.publisher"),
    align: "left",
  },
  {
    name: "subject",
    field: "subject",
    label: t("book.fields.subject"),
    align: "left",
  },
  {
    name: "title",
    field: "title",
    label: t("book.fields.title"),
    align: "left",
  },
  {
    name: "cover-price",
    field: "originalPrice",
    label: t("book.fields.price"),
    align: "left",
    format: (val: number) => `${val.toFixed(2)} €`,
  },
  {
    name: "buy-price",
    // FIXME: add field and enable format
    field: () => undefined,
    label: t("manageUsers.checkOutUserDialog.buyPrice"),
    align: "left",
    // format: (val: number) => `${val.toFixed(2)} €`,
  },
  {
    name: "public-price",
    // FIXME: add field and enable format
    field: () => undefined,
    label: t("manageUsers.checkOutUserDialog.publicPrice"),
    align: "left",
    // format: (val: number) => `${val.toFixed(2)} €`,
  },
  {
    name: "actions",
    field: () => undefined,
    label: "",
  },
]);

const pagination: QTableProps["pagination"] = {
  rowsPerPage: 0,
};

const stockRows = ref<BookSummaryFragment[]>([]);
const returnedRows = ref<BookSummaryFragment[]>([]);
const soldRows = ref<BookSummaryFragment[]>([]);

const selectedRowsIDs = ref<string[]>([]);

const bookLoading = ref(false);

// FIXME: change query and logic to the actual separate queries once the infrastructure is set up
const { refetchBooks } = useBookService(ref(0), ref(100));

onMounted(async () => {
  bookLoading.value = true;

  // FIXME: also change logic here to match the queries above
  // Remember to add the sorting of stockRows by book copy ID
  const newBooks = await refetchBooks();
  stockRows.value =
    newBooks?.data.books.rows
      .slice(0, 6)
      .sort((bookA, bookB) =>
        bookA.originalPrice > bookB.originalPrice ? 1 : -1,
      ) ?? stockRows.value;
  returnedRows.value =
    newBooks?.data.books.rows.slice(6, 12) ?? returnedRows.value;
  soldRows.value = newBooks?.data.books.rows.slice(12, 18) ?? soldRows.value;

  bookLoading.value = false;
});

enum Titles {
  InStock = "in-stock",
  Returned = "returned",
  Sold = "sold",
}
interface GroupHeaderRow {
  id: Titles;
}
const tableRows = computed<(BookSummaryFragment | GroupHeaderRow)[]>(() => [
  // Adding one empty row for each of the sub-headers, then merging all the
  // separate rows into the same array to display them all in a single table
  {
    id: Titles.InStock,
  },
  ...stockRows.value,
  {
    id: Titles.Returned,
  },
  ...returnedRows.value,
  {
    id: Titles.Sold,
  },
  ...soldRows.value,
]);

const selectableRowsIDs = computed(() =>
  stockRows.value
    .filter((row) => row.id.endsWith("0") /* FIXME: add real filter logic */)
    .map((row) => row.id),
);

const localizedSectionTitle = (sectionTitle: Titles) => {
  return sectionTitle === Titles.InStock
    ? t("manageUsers.checkOutUserDialog.booksInStock")
    : sectionTitle === Titles.Returned
    ? t("manageUsers.checkOutUserDialog.returnedBooks")
    : t("manageUsers.checkOutUserDialog.soldBooks");
};

const rowsSelectionStatus = computed(() =>
  selectedRowsIDs.value.length === 0
    ? false
    : selectedRowsIDs.value.length === selectableRowsIDs.value.length
    ? true
    : undefined,
);

function swapAllRows() {
  selectedRowsIDs.value =
    selectedRowsIDs.value.length > 0 ? [] : cloneDeep(selectableRowsIDs.value);
}

function swapRow(rowID: string) {
  if (selectedRowsIDs.value.includes(rowID)) {
    selectedRowsIDs.value.splice(selectedRowsIDs.value.indexOf(rowID), 1);
  } else {
    selectedRowsIDs.value.push(rowID);
  }
}

function returnBooks(books: string[]) {
  // FIXME: add logic
  books;
}

function donateBooks(books: string[]) {
  // FIXME: add logic with dialog creation
  books;
}

function repayBooks(books: string[]) {
  // FIXME: add logic with dialog creation
  books;
}

function reportProblems(books: string[]) {
  // FIXME: add logic with dialog creation
  books;
}
</script>

<style scoped lang="scss">
// This class is used so that the bulk action buttons
// can be seen without scrolling the table to the right
.sticky-button-group {
  position: sticky;
  right: 16px;
}
</style>
