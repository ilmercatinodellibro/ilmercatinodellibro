<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :title="$t('reserveBooks.confirmReserveByClassDialog.title')"
      :save-label="$t('reserveBooks.reserveAll')"
      size="fullscreen"
      show-save-button
      @cancel="onDialogCancel()"
      @save="onDialogOK(booksToReserve)"
    >
      <q-card-section>
        <p class="text-subtitle1">
          {{ $t("reserveBooks.confirmReserveByClassDialog.message") }}
        </p>
        <p class="text-h6 text-weight-medium">
          {{ $t("reserveBooks.confirmReserveByClassDialog.disclaimer") }}
        </p>
      </q-card-section>

      <dialog-table
        :columns="columns"
        :rows="booksToReserve"
        class="flex-delegate-height-management"
      >
        <template #body-cell-author="{ value, col }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>

        <template #body-cell-subject="{ value, col }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>
        <template #body-cell-actions="{ row }">
          <q-td>
            <chip-button
              :label="
                $t('reserveBooks.confirmReserveByClassDialog.removeFromList')
              "
              color="negative"
              @click="remove(booksToReserve, row)"
            />
          </q-td>
        </template>
      </dialog-table>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { cloneDeep, remove } from "lodash-es";
import { QTableColumn, useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { formatPrice } from "src/composables/use-misc-formats";
import { discountedPrice } from "src/helpers/book-copy";
import { BookSummaryFragment } from "src/services/book.graphql";
import { BookWithAvailableCopiesFragment } from "src/services/cart.graphql";
import KDialogCard from "./k-dialog-card.vue";
import chipButton from "./manage-users/chip-button.vue";
import dialogTable from "./manage-users/dialog-table.vue";
import TableCellWithTooltip from "./manage-users/table-cell-with-tooltip.vue";

const props = defineProps<{
  classBooks: BookSummaryFragment[];
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
  useDialogPluginComponent<BookSummaryFragment[]>();

const { t } = useI18n();

const columns = computed<QTableColumn<BookWithAvailableCopiesFragment>[]>(
  () => [
    {
      name: "isbn",
      field: "isbnCode",
      label: t("book.fields.isbn"),
      align: "left",
    },
    {
      name: "author",
      field: "authorsFullName",
      label: t("book.fields.author"),
      align: "left",
      classes: "max-width-160 ellipsis",
    },
    {
      name: "subject",
      field: "subject",
      label: t("book.fields.subject"),
      align: "left",
      classes: "max-width-160 ellipsis",
    },
    {
      name: "title",
      field: "title",
      label: t("book.fields.title"),
      align: "left",
      classes: "text-wrap",
    },
    {
      name: "availability",
      field: ({ meta }) => meta.isAvailable,
      label: t("book.fields.availability"),
      align: "left",
    },
    {
      name: "cover-price",
      field: "originalPrice",
      label: t("book.fields.coverPrice"),
      align: "left",
      format: formatPrice,
      classes: "text-strike text-black-54",
    },
    {
      name: "price",
      field: ({ originalPrice }) => originalPrice,
      label: t("book.fields.price"),
      align: "left",
      format: (val: number) => discountedPrice(val, "sell"),
    },
    {
      name: "available-copies",
      field: ({ copies }) => copies?.length ?? 0,
      label: t("reserveBooks.availableCopies"),
      align: "left",
    },
    {
      name: "actions",
      field: () => undefined,
      label: "",
    },
  ],
);

const booksToReserve = ref(cloneDeep(props.classBooks));
</script>
