<template>
  <q-dialog
    ref="dialogRef"
    v-bind="isMobile ? { maximized: true, fullHeight: true } : undefined"
    @hide="onDialogHide"
  >
    <k-dialog-card
      :class="isMobile ? 'sticky-last-column' : ''"
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
        <p class="line-height-20 text-size-20 text-weight-medium">
          {{ $t("reserveBooks.confirmReserveByClassDialog.disclaimer") }}
        </p>
      </q-card-section>

      <dialog-table
        :columns="columns"
        :rows="booksToReserve"
        class="flex-delegate-height-management"
      >
        <template #body-cell-author="cellProps">
          <table-cell-with-tooltip
            :props="cellProps"
            :value="cellProps.value"
          />
        </template>

        <template #body-cell-subject="cellProps">
          <table-cell-with-tooltip
            :props="cellProps"
            :value="cellProps.value"
          />
        </template>

        <template #body-cell-availability="cellProps">
          <q-td :props="cellProps">
            <status-chip :value="cellProps.value" />
          </q-td>
        </template>

        <template #body-cell-actions="cellProps">
          <q-td :props="cellProps">
            <chip-button
              v-if="!isMobile"
              :label="
                $t('reserveBooks.confirmReserveByClassDialog.removeFromList')
              "
              color="negative"
              @click="remove(booksToReserve, cellProps.row)"
            />
            <actions-list-button v-else>
              <q-item
                v-close-popup
                clickable
                @click="remove(booksToReserve, cellProps.row)"
              >
                <q-item-section>
                  <q-item-label>
                    {{
                      t(
                        "reserveBooks.confirmReserveByClassDialog.removeFromList",
                      )
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </actions-list-button>
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
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { calculateBookCopyPrice } from "src/helpers/book-copy";
import { formatPrice } from "src/helpers/formatting";
import { BookWithAvailableCopiesFragment } from "src/services/cart.graphql";
import ActionsListButton from "./actions-list-button.vue";
import KDialogCard from "./k-dialog-card.vue";
import chipButton from "./manage-users/chip-button.vue";
import dialogTable from "./manage-users/dialog-table.vue";
import StatusChip from "./manage-users/status-chip.vue";
import TableCellWithTooltip from "./manage-users/table-cell-with-tooltip.vue";

const props = defineProps<{
  classBooks: BookWithAvailableCopiesFragment[];
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { t } = useI18n();

const { dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
  useDialogPluginComponent<BookWithAvailableCopiesFragment[]>();

const { isMobile } = useLateralDrawer();

const columns = computed<QTableColumn<BookWithAvailableCopiesFragment>[]>(
  () => [
    {
      name: "isbn",
      field: "isbnCode",
      label: t("book.fields.isbn"),
      align: "left",
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
      name: "author",
      field: "authorsFullName",
      label: t("book.fields.author"),
      align: "left",
      classes: "max-width-160 ellipsis",
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
      field: ({ originalPrice }) =>
        calculateBookCopyPrice(originalPrice, "sell"),
      label: t("book.fields.price"),
      align: "left",
      format: formatPrice,
    },
    {
      name: "availability",
      field: ({ meta }) => meta.isAvailable,
      label: t("book.fields.availability"),
      align: "left",
    },
    {
      name: "available-copies",
      field: ({ copies }) => copies?.length ?? 0,
      label: t("reserveBooks.availableCopies"),
      align: "center",
    },
    {
      name: "actions",
      field: () => undefined,
      label: "",
      classes: isMobile.value ? "no-padding" : "",
    },
  ],
);

const booksToReserve = ref(cloneDeep(props.classBooks));
</script>
