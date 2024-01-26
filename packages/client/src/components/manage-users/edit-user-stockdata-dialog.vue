<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      size="lg"
      :cancel-label="$t('common.close')"
      :title="
        $t('manageUsers.inStockDialog.title', [
          userData.firstname,
          userData.lastname,
        ])
      "
      @cancel="onDialogCancel"
    >
      <q-card-section class="q-pa-none">
        <q-tabs
          v-model="tab"
          align="justify"
          active-color="accent"
          inline-label
        >
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

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="in-retrieval" class="column no-wrap q-pa-none">
            <div class="gap-16 items-center no-wrap q-pa-md row">
              <q-input
                v-model="newBookISBN"
                :placeholder="$t('manageUsers.inStockDialog.searchHint')"
                class="width-420"
                debounce="200"
                outlined
                type="text"
                @keyup.enter="addBookToInRetrieval()"
              />
              <q-btn
                :label="$t('book.addBookDialog')"
                color="accent"
                :icon="mdiPlus"
                no-wrap
                @click="addBookToInRetrieval"
              />
              <q-space />
              <q-btn
                :disable="inRetrievalRows.length === 0"
                :label="$t('manageUsers.inStockDialog.retrieveBtn')"
                color="primary"
                no-wrap
                @click="retrieveAllBooks"
              />
            </div>

            <dialog-table
              :pagination="inRetrievalPagination"
              :columns="inRetrievalColumns"
              :rows="inRetrievalRows"
              :loading="inRetrievalLoading"
              :on-request="onInRetrievalRequest"
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
                  <!-- This button has the same aspect of a q-chip -->
                  <q-btn
                    color="primary"
                    no-wrap
                    class="min-height-none q-chip--dense q-chip--square row"
                    @click="() => deleteBookDialog(value)"
                  >
                    <q-item-label> {{ $t("common.delete") }} </q-item-label>
                    <q-icon
                      class="q-ml-sm"
                      :name="mdiInformationOutline"
                      size="18px"
                    >
                      <q-tooltip>
                        {{
                          $t("manageUsers.inStockDialog.deleteBookBtnTooltip")
                        }}
                      </q-tooltip>
                    </q-icon>
                  </q-btn>
                </q-td>
              </template>
            </dialog-table>
          </q-tab-panel>

          <q-tab-panel name="retrieved" class="column no-wrap q-pa-none">
            <dialog-table
              :pagination="retrievedPagination"
              :columns="retrievedColumns"
              :rows="retrievedRows"
              :loading="retrievedLoading"
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
            </dialog-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiInformationOutline, mdiPlus } from "@quasar/extras/mdi-v7";
import { startCase, toLower } from "lodash-es";
import { Dialog, QTable, QTableProps, useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";
import { UserFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import UtilityChip from "../utility-chip.vue";
import DialogTable from "./dialog-table.vue";
import RetrieveAllBooksDialog from "./retrieve-all-books-dialog.vue";
import StatusChip from "./status-chip.vue";

const inRetrievalCurrentPage = ref(0);
const retrievedCurrentPage = ref(0);

const inRetrievalRowsPerPage = ref(5);
const retrievedRowsPerPage = ref(5);

const newBookISBN = ref("");

const {
  refetchBooks: refetchInRetrievalBooks,
  booksPaginationDetails: inRetrievalBooksPaginationDetails,
} = useBookService(inRetrievalCurrentPage, inRetrievalRowsPerPage);

const {
  refetchBooks: refetchRetrievedBooks,
  booksPaginationDetails: retrievedBooksPaginationDetails,
} = useBookService(retrievedCurrentPage, retrievedRowsPerPage);

const { t } = useI18n();

const tab = ref("in-retrieval");

const inRetrievalLoading = ref(false);
const retrievedLoading = ref(false);

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

// FIXME: fill all the missing fields from the columns
const inRetrievalColumns = computed(
  () =>
    [
      {
        label: t("book.fields.isbn"),
        field: "isbnCode",
        name: "isbn",
        align: "left",
        format: (val: string) => startCase(toLower(val)),
      },
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
        field: "status",
        name: "status",
        align: "left",
      },
      {
        label: t("book.conditions"),
        field: "conditions",
        name: "conditions",
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
        field: "utility",
        name: "utility",
        align: "center",
      },
      {
        label: t("manageUsers.actions"),
        field: "",
        name: "actions",
        align: "center",
      },
    ] satisfies QTableProps["columns"],
);
const retrievedColumns = computed(
  () =>
    [
      {
        label: t("book.fields.isbn"),
        field: "isbnCode",
        name: "isbn",
        align: "left",
      },
      {
        label: t("book.code"),
        field: "code",
        name: "code",
        align: "left",
      },
      {
        label: t("book.originalCode"),
        field: "originalCode",
        name: "original-code",
        align: "left",
      },
      {
        label: t("book.fields.author"),
        field: "authorsFullName",
        name: "author",

        align: "left",
      },
      {
        label: t("book.fields.subject"),
        field: "subject",
        name: "subject",

        align: "left",
      },
      {
        label: t("book.fields.status"),
        field: "status",
        name: "status",
        align: "left",
      },
      {
        label: t("book.conditions"),
        field: "conditions",
        name: "conditions",
        align: "left",
      },
      {
        label: t("book.fields.title"),
        field: "title",
        name: "title",

        align: "left",
      },
      {
        label: t("book.fields.publisher"),
        field: "publisherName",
        name: "publisher",

        align: "left",
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
        field: "utility",
        name: "utility",
        align: "center",
      },
    ] satisfies QTableProps["columns"],
);

defineProps<{
  userData: UserFragment;
}>();

// FIXME: add actual retrieval logic on both onRequest functions
const onInRetrievalRequest: QTable["onRequest"] = async function (
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

function addBookToInRetrieval() {
  // FIXME: add logic to add a book into "in retrieval" section
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

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>
