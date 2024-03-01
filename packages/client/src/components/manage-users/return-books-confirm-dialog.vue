<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-card
      :title="title"
      size="fullscreen"
      @save="onDialogOK"
      @cancel="onDialogCancel"
    >
      <q-card-section class="gap-16 items-center no-wrap q-pa-md row">
        <q-input
          v-model="totalSoldBooks"
          :label="$t('manageUsers.payOffUserDialog.soldBooksCountLabel')"
          outlined
          readonly
        />
        <q-input
          :label="$t('manageUsers.payOffUserDialog.totalPayOffLabel')"
          :model-value="totalCheckoutMoney.toFixed(2)"
          outlined
          readonly
          suffix="€"
        />
        <q-input
          :label="$t('manageUsers.payOffUserDialog.totalCheckedOutLabel')"
          :model-value="totalCheckedOutMoney.toFixed(2)"
          outlined
          readonly
          suffix="€"
        />
      </q-card-section>

      <span class="q-pa-md text-h6 text-negative">
        {{ disclaimer }}
      </span>

      <span class="bg-grey-1 height-48 q-pa-md text-size-13 text-weight-medium">
        {{ tableTitle }}
      </span>
      <q-separator />
      <dialog-table
        :columns="columns"
        :rows="booksToReturn"
        :rows-per-page-options="[0]"
      />
      <template #card-actions>
        <q-btn :label="$t('common.cancel')" flat @click="onDialogCancel" />
        <q-btn :label="saveLabel" color="positive" @click="onDialogOK" />
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QTableColumn, useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";
import KDialogCard from "../k-dialog-card.vue";
import DialogTable from "./dialog-table.vue";

defineProps<{
  booksToReturn: BookCopyDetailsFragment[];
  disclaimer: string;
  saveLabel: string;
  tableTitle: string;
  title: string;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

const { t } = useI18n();

const totalSoldBooks = ref(0);
const totalCheckoutMoney = ref(0);
const totalCheckedOutMoney = ref(0);

const columns = computed<QTableColumn<BookCopyDetailsFragment>[]>(() => [
  {
    name: "isbn-code",
    field: ({ book }) => book.isbnCode,
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
    name: "author",
    field: ({ book }) => book.authorsFullName,
    label: t("book.fields.author"),
    align: "left",
  },
  {
    name: "publisher",
    field: ({ book }) => book.publisherName,
    label: t("book.fields.publisher"),
    align: "left",
  },
  {
    name: "subject",
    field: ({ book }) => book.subject,
    label: t("book.fields.subject"),
    align: "left",
  },
  {
    name: "title",
    field: ({ book }) => book.title,
    label: t("book.fields.title"),
    align: "left",
  },
]);
</script>
