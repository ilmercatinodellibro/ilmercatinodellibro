<template>
  <dialog-table
    :class="isMobile ? 'sticky-last-column' : ''"
    :rows="rows"
    :columns="columns"
  >
    <template #body-cell-author="cellProps">
      <table-cell-with-tooltip :peops="cellProps" :value="cellProps.value" />
    </template>

    <template #body-cell-subject="cellProps">
      <table-cell-with-tooltip :props="cellProps" :value="cellProps.value" />
    </template>

    <template #body-cell-request-status="cellProps">
      <q-td
        :props="cellProps"
        :class="
          cellProps.value && !isShowingReservations ? 'text-positive' : ''
        "
      >
        {{
          t(
            isShowingReservations
              ? "book.availability.reserved"
              : cellProps.value
                ? "book.availability.available"
                : "book.availability.requested",
          )
        }}
      </q-td>
    </template>
    <template #body-cell-utility="cellProps">
      <q-td :props="cellProps">
        <utility-chip :utility="cellProps.value" />
      </q-td>
    </template>
    <template #body-cell-actions="cellProps">
      <q-td :props="cellProps">
        <!-- To define the options available inside the menu and their behavior -->
        <slot
          name="book-actions"
          v-bind="{ requestOrReservation: cellProps.row }"
        />
      </q-td>
    </template>
  </dialog-table>
</template>

<script setup lang="ts">
import { noop, startCase, toLower } from "lodash-es";
import type { QTableColumn, QTableProps } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLateralDrawer } from "@/composables/use-lateral-drawer";
import { calculateBookCopyPrice } from "@/helpers/book-copy";
import { formatPrice } from "@/helpers/formatting";
import type { RequestSummaryFragment } from "@/services/request.graphql";
import type { ReservationSummaryFragment } from "@/services/reservation.graphql";
import UtilityChip from "../utility-chip.vue";
import DialogTable from "./dialog-table.vue";
import TableCellWithTooltip from "./table-cell-with-tooltip.vue";

defineProps<
  {
    isShowingReservations?: boolean;
    rows:
      readonly ReservationSummaryFragment[] | readonly RequestSummaryFragment[];
    // eslint-disable-next-line vue/no-unused-properties
  } & Pick<QTableProps, "loading">
>();

const { t } = useI18n();

const { isMobile } = useLateralDrawer();

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
    name: "subject",
    field: ({ book: { subject } }) => subject,
    label: t("book.fields.subject"),
    align: "left",
    format: (value: string) => startCase(toLower(value)),
    classes: "max-width-160 ellipsis",
  },
  {
    name: "title",
    field: ({ book: { title } }) => title,
    label: t("book.fields.title"),
    align: "left",
    format: (value: string) => startCase(toLower(value)),
    classes: "text-wrap",
  },
  {
    name: "author",
    field: ({ book: { authorsFullName } }) => authorsFullName,
    label: t("book.fields.author"),
    align: "left",
    format: (value: string) => startCase(toLower(value)),
    classes: "max-width-160 ellipsis",
  },
  {
    name: "publisher",
    field: ({ book: { publisherName } }) => publisherName,
    label: t("book.fields.publisher"),
    align: "left",
    format: (value: string) => startCase(toLower(value)),
  },
  {
    name: "price",
    field: ({ book: { originalPrice } }) =>
      calculateBookCopyPrice(originalPrice, "sell"),
    label: t("book.fields.price"),
    align: "left",
    format: formatPrice,
  },
  {
    name: "utility",
    field: ({ book }) => book.utility,
    label: t("book.fields.utility"),
    align: "center",
  },
  {
    name: "actions",
    field: noop,
    label: t("manageUsers.actions"),
    align: "center",
    classes: isMobile.value ? "no-padding" : "",
  },
]);
</script>
