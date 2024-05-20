<template>
  <dialog-table :rows="rows" :columns="columns">
    <template #body-cell-author="{ value, col }">
      <table-cell-with-tooltip :class="col.classes" :value="value" />
    </template>

    <template #body-cell-subject="{ value, col }">
      <table-cell-with-tooltip :class="col.classes" :value="value" />
    </template>

    <template #body-cell-request-status="{ value }">
      <q-td>
        <span :class="value && !isShowingReservations ? 'text-positive' : ''">
          {{
            t(
              isShowingReservations
                ? "book.availability.reserved"
                : value
                  ? "book.availability.available"
                  : "book.availability.requested",
            )
          }}
        </span>
      </q-td>
    </template>
    <template #body-cell-utility="{ value }">
      <q-td>
        <utility-chip :utility="value" />
      </q-td>
    </template>
    <template #body-cell-actions="{ row }">
      <q-td>
        <!--
          Slot here so every usage of this component can define the
          options available inside the menu and their behavior
        -->
        <slot name="book-actions" v-bind="{ requestOrReservation: row }" />
      </q-td>
    </template>
  </dialog-table>
</template>

<script setup lang="ts">
import { startCase, toLower } from "lodash-es";
import { QTableColumn, QTableProps } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { discountedPrice } from "src/helpers/book-copy";
import { RequestSummaryFragment } from "src/services/request.graphql";
import { ReservationSummaryFragment } from "src/services/reservation.graphql";
import UtilityChip from "../utility-chip.vue";
import DialogTable from "./dialog-table.vue";
import TableCellWithTooltip from "./table-cell-with-tooltip.vue";
const { t } = useI18n();

defineProps<
  {
    isShowingReservations?: boolean;
    rows:
      | readonly ReservationSummaryFragment[]
      | readonly RequestSummaryFragment[];
    // eslint-disable-next-line vue/no-unused-properties
  } & Pick<QTableProps, "loading">
>();

const columns = computed<
  QTableColumn<ReservationSummaryFragment | RequestSummaryFragment>[]
>(() => [
  {
    name: "request-status",
    field: ({ book: { meta } }) => meta.isAvailable,
    label: t("manageUsers.reservedBooksDialog.requestStatus"),
    align: "left",
  },
  {
    name: "isbn",
    field: ({ book: { isbnCode } }) => isbnCode,
    label: t("book.fields.isbn"),
    align: "left",
  },
  {
    name: "author",
    field: ({ book: { authorsFullName } }) => authorsFullName,
    label: t("book.fields.author"),
    align: "left",
    format: (val: string) => startCase(toLower(val)),
    classes: "max-width-160 ellipsis",
  },
  {
    name: "subject",
    field: ({ book: { subject } }) => subject,
    label: t("book.fields.subject"),
    align: "left",
    format: (val: string) => startCase(toLower(val)),
    classes: "max-width-160 ellipsis",
  },
  {
    name: "title",
    field: ({ book: { title } }) => title,
    label: t("book.fields.title"),
    align: "left",
    format: (val: string) => startCase(toLower(val)),
    classes: "text-wrap",
  },
  {
    name: "publisher",
    field: ({ book: { publisherName } }) => publisherName,
    label: t("book.fields.publisher"),
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    name: "price",
    field: ({ book: { originalPrice } }) => originalPrice,
    label: t("book.fields.price"),
    align: "left",
    format: (val: number) => discountedPrice(val, "sell"),
  },
  {
    name: "utility",
    field: ({ book }) => book.utility,
    label: t("book.fields.utility"),
    align: "center",
  },
  {
    name: "actions",
    field: () => undefined,
    label: t("manageUsers.actions"),
    align: "center",
  },
]);
</script>
