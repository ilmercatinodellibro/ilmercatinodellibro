<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="column dialog-wrapper no-wrap q-pa-none">
      <q-card-section class="col">
        <div class="text-h6">
          {{
            $t(
              "manageUsers.booksMovementsDialog." +
                (type === "sold" ? "soldTitle" : "purchasedTitle"),
              [userData.firstname, userData.lastname],
            )
          }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="col column no-wrap q-pb-none q-px-none">
        <dialog-table
          v-if="type === 'sold'"
          :columns="soldColumns"
          :rows="soldRows"
          :loading="soldLoading"
          :pagination="soldPagination"
          @request="onSoldRequest"
        >
          <template #body-cell-problems="{ value }">
            <q-td class="text-center">
              <q-btn
                class="min-height-none q-chip--dense q-chip--square"
                :label="
                  $t(
                    'manageUsers.bookMovementsDialog' + value
                      ? 'report'
                      : 'solve',
                  )
                "
                :color="value ? 'red' : 'green'"
                @click="
                  openProblemDialog(
                    value,
                  ) /* TODO: Add actual logic for history button */
                "
              />
            </q-td>
          </template>
          <template #body-cell-history="{ value }">
            <q-td class="text-center">
              <q-btn
                round
                flat
                color="primary"
                icon="mdi-history"
                @click="
                  openHistoryDialog(
                    value,
                  ) /* TODO: Add actual logic for history button */
                "
              />
            </q-td>
          </template>
        </dialog-table>

        <dialog-table
          v-else
          :columns="purchasedColumns"
          :rows="purchasedRows"
          :loading="purchasedLoading"
          :pagination="purchasedPagination"
          @request="onPurchasedRequest"
        >
          <template #body-cell-actions="{ value }">
            <q-td class="text-center">
              <q-btn
                class="min-height-none q-chip--dense q-chip--square"
                :label="$t('book.returned')"
                color="primary"
                @click="
                  openActionsDialog(
                    value,
                  ) /* TODO: Add actual logic for actions button*/
                "
              />
            </q-td>
          </template>
        </dialog-table>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.close')" @click="onDialogOK(userData)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QDialog, QTable, QTableProps, useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { User } from "src/@generated/graphql";
import { useBookService } from "src/services/book";
import { BookSummary } from "src/services/book.service";
import DialogTable from "./dialog-table.vue";

const currentSoldPage = ref(0);
const currentPurchasedPage = ref(0);

const soldRowsPerPage = ref(5);
const purchasedRowsPerPage = ref(5);

const soldLoading = ref(false);
const purchasedLoading = ref(false);

const {
  refetchBooks: refetchSoldBooks,
  booksPaginationDetails: soldBooksPaginationDetails,
} = useBookService(currentSoldPage, soldRowsPerPage, ref(""));
const {
  refetchBooks: refetchPurchasedBooks,
  booksPaginationDetails: purchasedBooksPaginationDetails,
} = useBookService(currentPurchasedPage, purchasedRowsPerPage, ref(""));

const soldPagination = ref({
  rowsPerPage: soldRowsPerPage.value,
  rowsNumber: soldBooksPaginationDetails.value.rowCount,
  page: currentSoldPage.value,
});
const purchasedPagination = ref({
  rowsPerPage: purchasedRowsPerPage.value,
  rowsNumber: purchasedBooksPaginationDetails.value.rowCount,
  page: currentPurchasedPage.value,
});

const { t } = useI18n();

defineProps<{
  type: "sold" | "purchased";
  userData: User;
}>();

//TODO: Insert missing field names
const soldColumns = computed(
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
        label: t("manageUsers.booksMovementsDialog.soldTo"),
        field: "soldTo",
        name: "soldTo",
        align: "left",
      },
      {
        label: "",
        field: "problems",
        name: "problems",
      },
      {
        label: "",
        field: "",
        name: "history",
      },
    ] satisfies QTableProps["columns"],
);

const purchasedColumns = computed(
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
        label: t("manageUsers.booksMovementsDialog.purchasedAt"),
        field: "",
        name: "purchasedAt",
        align: "left",
      },
      {
        label: t("manageUsers.booksMovementsDialog.theVendor"),
        field: "vendor",
        name: "vendor",
        align: "left",
      },
      {
        label: t("manageUsers.actions"),
        field: "",
        name: "actions",
        align: "center",
      },
    ] satisfies QTableProps["columns"],
);

const purchasedRows = ref<BookSummary[]>([]);
const soldRows = ref<BookSummary[]>([]);

const onSoldRequest: QTable["onRequest"] = async function (requestProps) {
  soldLoading.value = true;

  const newBooks = await refetchSoldBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
  });
  soldPagination.value.rowsNumber = newBooks?.data.books.rowsCount ?? 0;

  soldRows.value.splice(
    0,
    soldRows.value.length,
    ...(newBooks?.data.books.rows ?? soldRows.value),
  );

  soldPagination.value.page = requestProps.pagination.page;
  soldPagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;

  soldLoading.value = false;
};

const onPurchasedRequest: QTable["onRequest"] = async function (requestProps) {
  purchasedLoading.value = true;

  const newBooks = await refetchPurchasedBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
  });
  purchasedPagination.value.rowsNumber = newBooks?.data.books.rowsCount ?? 0;

  purchasedRows.value.splice(
    0,
    purchasedRows.value.length,
    ...(newBooks?.data.books.rows ?? purchasedRows.value),
  );

  purchasedPagination.value.page = requestProps.pagination.page;
  purchasedPagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;

  purchasedLoading.value = false;
};

function openProblemDialog(value: unknown) {
  // TODO: add logic
  value;
}

function openHistoryDialog(value: unknown) {
  // TODO: add logic
  value;
}

function openActionsDialog(value: unknown) {
  // TODO: add logic
  value;
}

const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>

<style scoped lang="scss">
.dialog-wrapper {
  max-width: 100% !important;
}
</style>
