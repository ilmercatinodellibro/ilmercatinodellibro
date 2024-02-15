<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      size="lg"
      :cancel-label="$t('common.close')"
      :title="$t(titlePath, [userData.firstname, userData.lastname])"
      @cancel="onDialogCancel()"
    >
      <q-card-section class="col-grow column height-0 no-wrap q-pa-none">
        <dialog-table
          v-if="type === 'sold'"
          :columns="soldColumns"
          :rows="soldBookCopies"
          :loading="soldLoading"
        >
          <template #body-cell-problems="{ value }">
            <q-td class="text-center">
              <!-- This button has the same aspect of a q-chip -->
              <q-btn
                class="min-height-0 q-chip--dense q-chip--square"
                :label="
                  $t(
                    'manageUsers.booksMovementsDialog.' +
                      (value ? 'reportProblem' : 'solveProblem'),
                  )
                "
                :color="value ? 'red' : 'green'"
                @click="
                  openProblemDialog(
                    value,
                  ) /* FIXME: Add actual logic for problems button */
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
                :icon="mdiHistory"
                @click="
                  openHistoryDialog(
                    value,
                  ) /* FIXME: Add actual logic for history button */
                "
              />
            </q-td>
          </template>
        </dialog-table>
        <dialog-table
          v-else
          :columns="purchasedColumns"
          :rows="purchasedBookCopies"
          :loading="purchasedLoading"
        >
          <template #body-cell-actions="{ value }">
            <q-td class="text-center">
              <!-- This button has the same aspect of a q-chip -->
              <q-btn
                class="min-height-0 q-chip--dense q-chip--square"
                :label="$t('book.return')"
                color="primary"
                @click="
                  openActionsDialog(
                    value,
                  ) /* FIXME: Add actual logic for actions button*/
                "
              />
            </q-td>
          </template>
        </dialog-table>
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiHistory } from "@quasar/extras/mdi-v7";
import { QDialog, QTableColumn, useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { User } from "src/@generated/graphql";
import KDialogCard from "src/components/k-dialog-card.vue";
import {
  BookCopyDetailsFragment,
  useGetPurchasedBookCopiesQuery,
  useGetSoldBookCopiesQuery,
} from "src/services/book-copy.graphql";
import DialogTable from "./dialog-table.vue";

const props = defineProps<{
  type: "sold" | "purchased";
  userData: User;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

const { t } = useI18n();

const titlePath = computed(
  () =>
    `manageUsers.booksMovementsDialog.${
      props.type === "sold" ? "soldTitle" : "purchasedTitle"
    }`,
);

const { soldBookCopies, loading: soldLoading } = useGetSoldBookCopiesQuery(
  () => ({
    userId: props.userData.id,
  }),
  () => ({
    enabled: props.type === "sold",
  }),
);

const { purchasedBookCopies, loading: purchasedLoading } =
  useGetPurchasedBookCopiesQuery(
    () => ({
      userId: props.userData.id,
    }),
    () => ({
      enabled: props.type === "purchased",
    }),
  );

const bookMiddleInfoColumns = computed<QTableColumn<BookCopyDetailsFragment>[]>(
  () => [
    {
      label: t("book.fields.author"),
      field: ({ book }) => book.authorsFullName,
      name: "author",
      align: "left",
    },
    {
      label: t("book.fields.subject"),
      field: ({ book }) => book.subject,
      name: "subject",
      align: "left",
    },
    {
      label: t("book.fields.title"),
      field: ({ book }) => book.title,
      name: "title",
      align: "left",
    },
    {
      label: t("book.fields.publisher"),
      field: ({ book }) => book.publisherName,
      name: "publisher",
      align: "left",
    },
  ],
);

const soldColumns = computed<QTableColumn<BookCopyDetailsFragment>[]>(() => [
  {
    label: t("book.fields.isbn"),
    field: ({ book }) => book.isbnCode,
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
    format: (val: string) => (val === "" ? "/" : val),
  },
  ...bookMiddleInfoColumns.value,
  {
    label: t("manageUsers.booksMovementsDialog.soldTo"),
    // TODO: add the field name
    field: () => undefined,
    name: "sold-to",
    align: "left",
  },
  {
    label: "",
    // TODO: add the field name
    field: () => undefined,
    name: "problems",
  },
  {
    label: "",
    field: () => undefined,
    name: "history",
  },
]);

const purchasedColumns = computed<QTableColumn<BookCopyDetailsFragment>[]>(
  () => [
    {
      label: t("book.fields.isbn"),
      field: ({ book }) => book.isbnCode,
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
    ...bookMiddleInfoColumns.value,
    {
      label: t("manageUsers.booksMovementsDialog.purchasedAt"),
      // TODO: add the field name
      field: () => undefined,
      name: "purchased-at",
      align: "left",
    },
    {
      label: t("manageUsers.booksMovementsDialog.theVendor"),
      // TODO: add the field name
      field: () => undefined,
      name: "vendor",
      align: "left",
    },
    {
      label: t("manageUsers.actions"),
      field: () => undefined,
      name: "actions",
      align: "center",
    },
  ],
);

function openProblemDialog(value: unknown) {
  // FIXME: add problem report dialog
  value;
}

function openHistoryDialog(value: unknown) {
  // FIXME: add logic
  value;
}

function openActionsDialog(value: unknown) {
  // FIXME: add logic
  value;
}
</script>
