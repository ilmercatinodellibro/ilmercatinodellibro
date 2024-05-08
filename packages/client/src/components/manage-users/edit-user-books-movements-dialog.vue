<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      size="fullscreen"
      :cancel-label="$t('common.close')"
      :title="title"
      @cancel="onDialogCancel()"
    >
      <dialog-table
        v-if="type === 'sold'"
        :columns="soldColumns"
        :loading="soldLoading"
        :rows="
          // prettier-ignore
          soldBookCopies as readonly SoldBookCopy[]
        "
        class="flex-delegate-height-management"
      >
        <template #body-cell-problems="{ row }">
          <q-td class="text-center">
            <problems-button :book-copy="row" />
          </q-td>
        </template>
        <template #body-cell-history="{ row }">
          <q-td class="text-center">
            <q-btn
              round
              flat
              color="primary"
              :icon="mdiHistory"
              @click="openHistoryDialog(row)"
            />
          </q-td>
        </template>
      </dialog-table>

      <dialog-table
        v-else
        :columns="purchasedColumns"
        :loading="purchasedLoading"
        :rows="
          // prettier-ignore
          purchasedBookCopies as readonly SoldBookCopy[]
        "
        class="flex-delegate-height-management"
      >
        <template #body-cell-return="{ row }">
          <q-td class="text-center">
            <chip-button
              :label="$t('book.return')"
              color="primary"
              @click="openReturnDialog(row)"
            />
          </q-td>
        </template>
      </dialog-table>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiHistory } from "@quasar/extras/mdi-v7";
import {
  Dialog,
  QDialog,
  QTableColumn,
  useDialogPluginComponent,
} from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import KDialogCard from "src/components/k-dialog-card.vue";
import {
  BookCopyDetailsFragment,
  useGetPurchasedBookCopiesQuery,
  useGetSoldBookCopiesQuery,
} from "src/services/book-copy.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import { UserSummaryFragment } from "src/services/user.graphql";
import ProblemsButton from "../problems-button.vue";
import ChipButton from "./chip-button.vue";
import DialogTable from "./dialog-table.vue";
import ProblemsHistoryDialog from "./problems-history-dialog.vue";
import ReturnBookDialog from "./return-book-dialog.vue";

// sold and purchased means the same thing, it's just a different perspective depending on which side the user is
type SoldBookCopy = BookCopyDetailsFragment & {
  purchasedAt: NonNullable<BookCopyDetailsFragment["purchasedAt"]>;
  purchasedBy: NonNullable<BookCopyDetailsFragment["purchasedBy"]>;
};

const props = defineProps<{
  type: "sold" | "purchased";
  userData: UserSummaryFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

const { t } = useI18n();

const title = computed(() =>
  t(
    props.type === "sold"
      ? "manageUsers.booksMovementsDialog.soldTitle"
      : "manageUsers.booksMovementsDialog.purchasedTitle",
    [`${props.userData.firstname} ${props.userData.lastname}`],
  ),
);

const { selectedLocation } = useRetailLocationService();

const { soldBookCopies, loading: soldLoading } = useGetSoldBookCopiesQuery(
  () => ({
    userId: props.userData.id,
    retailLocationId: selectedLocation.value.id,
  }),
  () => ({
    enabled: props.type === "sold",
  }),
);

const { purchasedBookCopies, loading: purchasedLoading } =
  useGetPurchasedBookCopiesQuery(
    () => ({
      userId: props.userData.id,
      retailLocationId: selectedLocation.value.id,
    }),
    () => ({
      enabled: props.type === "purchased",
    }),
  );

const bookMiddleInfoColumns = computed<QTableColumn<SoldBookCopy>[]>(() => [
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
]);

const soldColumns = computed<QTableColumn<SoldBookCopy>[]>(() => [
  {
    label: t("book.fields.isbn"),
    field: ({ book }) => book.isbnCode,
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
    format: (val: string) => (val === "" ? "/" : val),
  },
  ...bookMiddleInfoColumns.value,
  // TODO: not in the mockups, but should we add the date? (as an alternative to opening the history)
  {
    label: t("manageUsers.booksMovementsDialog.soldTo"),
    field: ({ purchasedBy }) => purchasedBy.email,
    name: "sold-to",
    align: "left",
  },
  {
    label: "",
    field: () => undefined,
    name: "problems",
  },
  {
    label: "",
    field: () => undefined,
    name: "history",
  },
]);

const purchasedColumns = computed<QTableColumn<SoldBookCopy>[]>(() => [
  {
    label: t("book.fields.isbn"),
    field: ({ book }) => book.isbnCode,
    name: "isbn",
    align: "left",
  },
  {
    label: t("book.code"),
    field: "code",
    name: "code",
    align: "left",
  },
  ...bookMiddleInfoColumns.value,
  // TODO: decide to keep/remove this. This column doesn't exist in the mockups, but might be nice to have the date
  {
    label: t("manageUsers.booksMovementsDialog.purchasedAt"),
    field: ({ purchasedAt }) => purchasedAt, // TODO: Format the date
    name: "purchased-at",
    align: "left",
  },
  {
    label: t("manageUsers.booksMovementsDialog.purchasedBy"),
    field: ({ owner }) => owner.email,
    name: "vendor",
    align: "left",
  },
  {
    label: t("manageUsers.actions"),
    field: () => undefined,
    name: "return",
    align: "center",
  },
]);

function openHistoryDialog(bookCopy: BookCopyDetailsFragment) {
  Dialog.create({
    component: ProblemsHistoryDialog,
    componentProps: {
      bookCopy,
    },
  });
}

function openReturnDialog(bookCopy: BookCopyDetailsFragment) {
  Dialog.create({
    component: ReturnBookDialog,
    componentProps: {
      bookCopy,
      user: props.userData,
    },
  }).onOk((payload) => {
    // FIXME: return book
    payload;
  });
}
</script>
