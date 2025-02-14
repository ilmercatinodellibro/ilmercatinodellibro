<template>
  <q-dialog
    ref="dialogRef"
    :full-height="isMobile"
    :maximized="isMobile"
    persistent
    @hide="onDialogHide"
  >
    <k-dialog-card
      :title="title"
      size="fullscreen"
      @save="onDialogOK"
      @cancel="onDialogCancel"
    >
      <q-card-section
        :class="isMobile ? 'column items-stretch' : 'items-center row'"
        class="gap-16 no-wrap q-pa-md"
      >
        <q-input
          :model-value="booksSoldToOthers"
          :dense="isMobile"
          :label="$t('manageUsers.payOffUserDialog.soldBooksCountLabel')"
          outlined
          readonly
        />
        <q-input
          :model-value="totalCheckoutMoney.toFixed(2)"
          :dense="isMobile"
          :label="$t('manageUsers.payOffUserDialog.totalPayOffLabel')"
          outlined
          readonly
          suffix="€"
        />
        <q-input
          :model-value="totalCheckedOutMoney.toFixed(2)"
          :dense="isMobile"
          :label="$t('manageUsers.payOffUserDialog.totalCheckedOutLabel')"
          outlined
          readonly
          suffix="€"
        />
      </q-card-section>

      <span class="line-height-20 q-pa-md text-h6 text-negative">
        {{ disclaimer }}
      </span>

      <span class="bg-grey-1 height-48 q-pa-md text-size-13 text-weight-medium">
        {{ tableTitle }}
      </span>

      <q-separator />

      <dialog-table
        :columns="columns"
        :rows="booksToReturn"
        class="flex-delegate-height-management"
      >
        <template #body-cell-author="{ value, col }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>

        <template #body-cell-subject="{ value, col }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>
      </dialog-table>

      <template #card-actions>
        <q-btn
          :label="$t('common.cancel')"
          :flat="!isMobile"
          :outline="isMobile"
          @click="onDialogCancel()"
        />
        <q-btn :label="saveLabel" color="positive" @click="onDialogOK()" />
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QTableColumn, useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";
import KDialogCard from "../k-dialog-card.vue";
import DialogTable from "./dialog-table.vue";
import TableCellWithTooltip from "./table-cell-with-tooltip.vue";

defineProps<{
  booksToReturn: BookCopyDetailsFragment[];
  disclaimer: string;
  saveLabel: string;
  tableTitle: string;
  title: string;
  booksSoldToOthers: number;
  totalCheckoutMoney: number;
  totalCheckedOutMoney: number;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { t } = useI18n();

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();
const { isMobile } = useLateralDrawer();

const columns = computed<QTableColumn<BookCopyDetailsFragment>[]>(() => [
  {
    name: "isbn-code",
    field: ({ book }) => book.isbnCode,
    label: t("book.fields.isbn"),
    align: "left",
  },
  {
    name: "subject",
    field: ({ book }) => book.subject,
    label: t("book.fields.subject"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "title",
    field: ({ book }) => book.title,
    label: t("book.fields.title"),
    align: "left",
    classes: "text-wrap",
  },
  {
    name: "author",
    field: ({ book }) => book.authorsFullName,
    label: t("book.fields.author"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "publisher",
    field: ({ book }) => book.publisherName,
    label: t("book.fields.publisher"),
    align: "left",
  },
  {
    name: "book-code",
    field: "code",
    label: t("book.code"),
    align: "left",
  },
]);
</script>
