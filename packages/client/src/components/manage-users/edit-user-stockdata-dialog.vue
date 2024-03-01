<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      size="fullscreen"
      :cancel-label="$t('common.close')"
      :title="
        $t('manageUsers.inStockDialog.title', [
          `${userData.firstname} ${userData.lastname}`,
        ])
      "
      @cancel="onDialogCancel"
    >
      <q-tabs v-model="tab" align="justify" active-color="accent" inline-label>
        <q-tab name="in-retrieval" :label="$t('manageUsers.inRetrieval')" />
        <q-tab name="retrieved" :label="$t('manageUsers.retrieved')">
          <template #default>
            <q-icon :name="mdiInformationOutline" class="q-ml-sm" size="sm">
              <q-tooltip>
                {{ $t("manageUsers.inStockDialog.retrievableTooltip") }}
              </q-tooltip>
            </q-icon>
          </template>
        </q-tab>
      </q-tabs>

      <q-tab-panels
        v-model="tab"
        animated
        class="col column dialog-panels flex-delegate-height-management no-wrap"
      >
        <q-tab-panel
          name="in-retrieval"
          class="col column flex-delegate-height-management no-wrap q-pa-none"
        >
          <card-table-header @add-book="addBookToInRetrieval">
            <template #side-actions>
              <q-btn
                :disable="inRetrievalRows.length === 0"
                :label="$t('manageUsers.inStockDialog.retrieveBtn')"
                color="primary"
                no-wrap
                @click="retrieveAllBooks"
              />
            </template>
          </card-table-header>

          <dialog-table
            v-model:pagination="inRetrievalPagination"
            :columns="inRetrievalColumns"
            :loading="inRetrievalLoading"
            :rows="inRetrievalRows"
            class="col"
            @request="onInRetrievalRequest"
          >
            <template #body-cell-status="{ value }">
              <q-td>
                <status-chip :value="value" />
              </q-td>
            </template>
            <template #body-cell-utility="{ value }">
              <q-td class="text-center">
                <utility-chip :value="value" />
              </q-td>
            </template>
            <template #body-cell-actions="{ value }">
              <q-td class="text-center">
                <chip-button
                  color="primary"
                  no-wrap
                  @click="() => deleteBookDialog(value)"
                >
                  <q-item-label> {{ $t("common.delete") }} </q-item-label>
                  <q-icon
                    class="q-ml-sm"
                    :name="mdiInformationOutline"
                    size="18px"
                  >
                    <q-tooltip>
                      {{ $t("manageUsers.inStockDialog.deleteBookBtnTooltip") }}
                    </q-tooltip>
                  </q-icon>
                </chip-button>
              </q-td>
            </template>
          </dialog-table>
        </q-tab-panel>

        <q-tab-panel
          name="retrieved"
          class="column flex-delegate-height-management no-wrap q-pa-none"
        >
          <dialog-table
            v-model:pagination="retrievedPagination"
            :columns="retrievedColumns"
            :loading="retrievedLoading"
            :rows="retrievedRows"
            class="col"
            @request="onRetrievedRequest"
          >
            <template #body-cell-status="{ value }">
              <q-td>
                <status-chip :value="value" />
              </q-td>
            </template>
            <template #body-cell-utility="{ value }">
              <q-td>
                <utility-chip :value="value" />
              </q-td>
            </template>
            <template #body-cell-actions="{ row }">
              <q-td>
                <chip-button
                  :label="
                    $t('manageUsers.payOffUserDialog.returnOptions.return')
                  "
                  color="primary"
                  @click="returnBook(row)"
                />
              </q-td>
            </template>
          </dialog-table>
        </q-tab-panel>
      </q-tab-panels>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiInformationOutline } from "@quasar/extras/mdi-v7";
import { startCase, toLower } from "lodash-es";
import {
  Dialog,
  QTable,
  QTableColumn,
  QTableProps,
  useDialogPluginComponent,
} from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";
import { UserFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import UtilityChip from "../utility-chip.vue";
import CardTableHeader from "./card-table-header.vue";
import ChipButton from "./chip-button.vue";
import DialogTable from "./dialog-table.vue";
import RetrieveAllBooksDialog from "./retrieve-all-books-dialog.vue";
import StatusChip from "./status-chip.vue";

const inRetrievalCurrentPage = ref(0);
const retrievedCurrentPage = ref(0);

const inRetrievalRowsPerPage = ref(5);
const retrievedRowsPerPage = ref(5);

const {
  refetchBooks: refetchInRetrievalBooks,
  booksPaginationDetails: inRetrievalBooksPaginationDetails,
  loading: inRetrievalLoading,
} = useBookService(inRetrievalCurrentPage, inRetrievalRowsPerPage);

const {
  refetchBooks: refetchRetrievedBooks,
  booksPaginationDetails: retrievedBooksPaginationDetails,
  loading: retrievedLoading,
} = useBookService(retrievedCurrentPage, retrievedRowsPerPage);

const { t } = useI18n();

const tab = ref("in-retrieval");

const inRetrievalRows = ref<BookSummaryFragment[]>([]);
const retrievedRows = ref<BookSummaryFragment[]>([]);

const inRetrievalPagination = ref({
  rowsPerPage: inRetrievalRowsPerPage.value,
  rowsNumber: inRetrievalBooksPaginationDetails.value.rowCount,
  page: inRetrievalCurrentPage.value,
});
const retrievedPagination = ref({
  rowsPerPage: retrievedRowsPerPage.value,
  rowsNumber: retrievedBooksPaginationDetails.value.rowCount,
  page: retrievedCurrentPage.value,
});

const commonColumns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    label: t("book.fields.author"),
    field: "authorsFullName",
    name: "author",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    label: t("book.fields.subject"),
    field: "subject",
    name: "subject",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    label: t("book.fields.status"),
    field: ({ meta }) => meta.isAvailable,
    name: "status",
    align: "left",
  },
  {
    label: t("book.fields.title"),
    field: "title",
    name: "title",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    label: t("book.fields.publisher"),
    field: "publisherName",
    name: "publisher",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    label: t("book.fields.price"),
    field: "originalPrice",
    name: "price",
    headerClasses: "text-center",
    align: "left",
    format: (val) => val + " €",
  },
  {
    label: t("book.fields.utility"),
    // TODO: add the field name
    field: () => undefined,
    name: "utility",
    align: "center",
  },
]);

const inRetrievalColumns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    label: t("book.fields.isbn"),
    field: "isbnCode",
    name: "isbn",
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },

  ...commonColumns.value,

  {
    label: t("manageUsers.actions"),
    field: () => undefined,
    name: "actions",
    align: "center",
  },
]);

const retrievedColumns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    label: t("book.fields.isbn"),
    field: "isbnCode",
    name: "isbn",
    align: "left",
  },
  {
    label: t("book.code"),
    // TODO: add the field name
    field: () => undefined,
    name: "code",
    align: "left",
  },
  {
    label: t("book.originalCode"),
    // TODO: add the field name
    field: () => undefined,
    name: "original-code",
    align: "left",
  },

  ...commonColumns.value,
  {
    label: t("manageUsers.actions"),
    field: () => undefined,
    name: "actions",
    align: "center",
  },
]);

defineProps<{
  userData: UserFragment;
}>();

// FIXME: add actual retrieval logic on both onRequest functions
const onInRetrievalRequest: QTableProps["onRequest"] = async function (
  requestProps,
) {
  inRetrievalLoading.value = true;

  const newBooks = await refetchInRetrievalBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
  });
  inRetrievalPagination.value.rowsNumber = newBooks?.data.books.rowsCount ?? 0;

  inRetrievalRows.value.splice(
    0,
    inRetrievalRows.value.length,
    ...(newBooks?.data.books.rows ?? inRetrievalRows.value),
  );

  inRetrievalPagination.value.page = requestProps.pagination.page;
  inRetrievalPagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;

  inRetrievalLoading.value = false;
};

const onRetrievedRequest: QTable["onRequest"] = async function (requestProps) {
  retrievedLoading.value = true;

  const newBooks = await refetchRetrievedBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
  });

  retrievedPagination.value.rowsNumber =
    retrievedBooksPaginationDetails.value.rowCount;

  retrievedRows.value.splice(
    0,
    retrievedRows.value.length,
    ...(newBooks?.data.books.rows ?? retrievedRows.value),
  );

  retrievedPagination.value.page = requestProps.pagination.page;
  retrievedPagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;

  retrievedLoading.value = false;
};

function addBookToInRetrieval(bookISBN: string) {
  // FIXME: add logic to add a book into "in retrieval" section
  bookISBN;
}

function retrieveAllBooks() {
  Dialog.create({
    component: RetrieveAllBooksDialog,
  }).onOk((payload) => {
    // FIXME: add the logic for the retrieval of all books
    payload;
  });
}

function deleteBookDialog(book: BookSummaryFragment) {
  Dialog.create({
    title: t("book.deleteBookDialog.title"),
    message: t("book.deleteBookDialog.message"),
    cancel: t("common.cancel"),
    ok: t("common.delete"),
    persistent: true,
  }).onOk(() => {
    // FIXME: Add the instructions for book deletion
    book;
  });
}

function returnBook(book: BookSummaryFragment) {
  // FIXME: return the book to the Mercatino
  book;
}

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>

<style lang="scss">
/*
  Adding this to make up for the child element of q-panels
  which is an otherwise inaccessible div
*/
.dialog-panels > .q-panel[role="tabpanel"],
.dialog-panels > * > .q-tab-panel[role="tabpanel"] {
  display: flex;
  overflow: auto;
  height: auto;
}
</style>
