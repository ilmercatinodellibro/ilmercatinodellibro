<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="col column full-height no-wrap">
      <q-card-section>
        <div class="text-h6 text-primary">
          {{
            $t("manageUsers.inStockDialog.title", [
              userData.firstname,
              userData.lastname,
            ])
          }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="col column no-wrap q-pa-none">
        <q-tabs v-model="tab" inline-label active-color="secondary">
          <q-tab
            name="in-retrieval"
            :label="$t('manageUsers.inRetrieval')"
            class="col"
          />
          <q-tab
            name="retrieved"
            :label="$t('manageUsers.retrieved')"
            class="col"
            inline
          >
            <template #default>
              <q-icon name="mdi-information-outline" class="q-ml-sm" size="sm">
                <q-tooltip>
                  {{ $t("manageUsers.inStockDialog.retrievableTooltip") }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-tab>
        </q-tabs>

        <q-tab-panels v-model="tab" animated class="col column no-wrap">
          <q-tab-panel name="in-retrieval" class="col column no-wrap q-pa-none">
            <div class="items-center justify-between q-pa-md row">
              <div class="gap-16 items-center no-wrap row">
                <q-input
                  v-model="inRetrievalSearchQuery"
                  type="search"
                  class="col col-shrink search-bar"
                  outlined
                  :placeholder="$t('manageUsers.inStockDialog.searchHint')"
                />
                <q-btn
                  class="col col-shrink"
                  color="secondary"
                  icon="mdi-plus"
                  :label="$t('book.addBookDialog')"
                  @click="addBookDialog"
                />
              </div>
              <q-btn
                class="col col-shrink"
                color="primary"
                :label="$t('manageUsers.inStockDialog.retrieveBtn')"
                @click="retrieveAllBooks"
              />
            </div>

            <dialog-table
              :pagination="inRetrievalPagination"
              :columns="inRetrievalColumns"
              :rows="inRetrievalRows"
              :search-query="inRetrievalSearchQuery"
              :loading="inRetrievalLoading"
              :on-request="onInRetrievalRequest"
            >
              <template #body-cell-status="{ value }">
                <q-td>
                  <div class="flex-center gap-16 no-wrap row">
                    <q-icon
                      :name="value ? 'mdi-check-circle' : 'mdi-cancel'"
                      :color="value ? 'green' : 'red'"
                      size="24px"
                    />
                    <span>
                      {{
                        $t(
                          "book.availability." +
                            (value ? "available" : "notAvailable"),
                        )
                      }}
                    </span>
                  </div>
                </q-td>
              </template>
              <template #body-cell-utility="{ value }">
                <q-td class="flex-center row text-center">
                  <utility-chip :value="value" />
                </q-td>
              </template>
              <template #body-cell-actions="{ value }">
                <q-td class="text-center">
                  <!-- This button has the same aspect of a q-chip -->
                  <q-btn
                    color="secondary"
                    no-wrap
                    class="min-height-none q-chip--dense q-chip--square row"
                    @click="() => deleteBookDialog(value)"
                  >
                    <q-item-label> {{ $t("common.delete") }} </q-item-label>
                    <q-icon
                      class="q-ml-sm"
                      name="mdi-information-outline"
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

          <q-tab-panel name="retrieved" class="col column no-wrap q-pa-none">
            <div class="items-center q-pa-md row">
              <q-input
                v-model="retrievedSearchQuery"
                type="search"
                outlined
                class="col-shrink search-bar"
                :placeholder="$t('manageUsers.inStockDialog.searchHint')"
              />
              <q-item class="col-shrink items-center row">
                <q-btn
                  color="secondary"
                  icon="mdi-plus"
                  :label="$t('book.addBookDialog')"
                  @click="addBookDialog"
                />
              </q-item>
            </div>

            <dialog-table
              :pagination="retrievedPagination"
              :columns="retrievedColumns"
              :rows="retrievedRows"
              :search-query="retrievedSearchQuery"
              :loading="retrievedLoading"
              @request="onRetrievedRequest"
            >
              <template #body-cell-status="{ value }">
                <q-td>
                  <div class="flex-center gap-16 no-wrap row">
                    <q-icon
                      :name="value ? 'mdi-check-circle' : 'mdi-cancel'"
                      :color="value ? 'green' : 'red'"
                      size="24px"
                    />
                    <span>
                      {{
                        $t(
                          "book.availability." +
                            (value ? "available" : "notAvailable"),
                        )
                      }}
                    </span>
                  </div>
                </q-td>
              </template>
              <template #body-cell-utility="{ value }">
                <q-td class="flex-center row text-center">
                  <utility-chip :value="value" />
                </q-td>
              </template>
            </dialog-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="bg-white">
        <q-btn
          color="white"
          flat
          :label="$t('common.close')"
          @click="onDialogCancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { startCase, toLower } from "lodash-es";
import { Dialog, QTable, QTableProps, useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book-copy.graphql";
import { UserFragment } from "src/services/user.graphql";
import AddBookDialog from "../add-book-dialog.vue";
import UtilityChip from "../utility-chip.vue";
import DialogTable from "./dialog-table.vue";
import RetrieveAllBooksDialog from "./retrieve-all-books-dialog.vue";

const inRetrievalCurrentPage = ref(0);
const retrievedCurrentPage = ref(0);

const inRetrievalRowsPerPage = ref(5);
const retrievedRowsPerPage = ref(5);

const retrievedSearchQuery = ref("");
const inRetrievalSearchQuery = ref("");

const {
  refetchBooks: refetchInRetrievalBooks,
  booksPaginationDetails: inRetrievalBooksPaginationDetails,
} = useBookService(
  inRetrievalCurrentPage,
  inRetrievalRowsPerPage,
  retrievedSearchQuery,
);

const {
  refetchBooks: refetchRetrievedBooks,
  booksPaginationDetails: retrievedBooksPaginationDetails,
} = useBookService(
  retrievedCurrentPage,
  retrievedRowsPerPage,
  inRetrievalSearchQuery,
);

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
        headerClasses: "ellipsis",
        classes: "ellipsis",
        align: "left",
        format: (val: string) => startCase(toLower(val)),
      },
      {
        label: t("book.fields.subject"),
        field: "subject",
        name: "subject",
        headerClasses: "ellipsis",
        classes: "ellipsis",
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
        headerClasses: "ellipsis",
        classes: "ellipsis",
        align: "left",
        format: (val: string) => startCase(toLower(val)),
      },
      {
        label: t("book.fields.publisher"),
        field: "publisherName",
        name: "publisher",
        headerClasses: "ellipsis",
        classes: "ellipsis",
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
        name: "originalCode",
        align: "left",
      },
      {
        label: t("book.fields.author"),
        field: "authorsFullName",
        name: "author",
        headerClasses: "ellipsis",
        classes: "ellipsis",
        align: "left",
      },
      {
        label: t("book.fields.subject"),
        field: "subject",
        name: "subject",
        headerClasses: "ellipsis",
        classes: "ellipsis",
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
        headerClasses: "ellipsis",
        classes: "ellipsis",
        align: "left",
      },
      {
        label: t("book.fields.publisher"),
        field: "publisherName",
        name: "publisher",
        headerClasses: "ellipsis",
        classes: "ellipsis",
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

const onInRetrievalRequest: QTable["onRequest"] = async function (
  requestProps,
) {
  inRetrievalLoading.value = true;

  const newBooks = await refetchInRetrievalBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
    filter: inRetrievalSearchQuery.value,
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
    filter: retrievedSearchQuery.value,
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

function addBookDialog() {
  Dialog.create({
    component: AddBookDialog,
  }).onOk((payload: string[]) => {
    payload; // FIXME: Load the new book in the database with the data passed from the dialog
  });
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

<style scoped lang="scss">
.search-bar {
  width: 420px;
}
</style>
