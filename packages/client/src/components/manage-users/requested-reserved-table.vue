<template>
  <dialog-table
    :rows="rows"
    :columns="columns"
    :pagination="pagination"
    @request="props.onRequest"
    @update:pagination="props['onUpdate:pagination']"
  >
    <template #body-cell-status="{ value }">
      <!-- FIXME: change to correct check for availability -->
      <span :class="value === 'available' ? 'text-positive' : ''">
        {{ value }}
      </span>
    </template>
    <template #body-cell-utility="{ value }">
      <q-td>
        <utility-chip :value="value" />
      </q-td>
    </template>
    <template #body-cell-actions="{ row }">
      <q-td>
        <!--
          Slot here so every usage of this component can define the
          options available inside the menu and their behavior
        -->
        <slot name="book-actions" v-bind="{ book: row }" />
      </q-td>
    </template>
  </dialog-table>
</template>

<script setup lang="ts">
import { startCase, toLower } from "lodash-es";
import { QTableColumn, QTableProps } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatPrice } from "src/composables/use-misc-formats";
import { BookSummaryFragment } from "src/services/book.graphql";
import UtilityChip from "../utility-chip.vue";
import DialogTable from "./dialog-table.vue";
const { t } = useI18n();

const props = defineProps<
  {
    rows: readonly BookSummaryFragment[];
    // eslint-disable-next-line vue/prop-name-casing, vue/no-unused-properties
  } & Pick<QTableProps, "pagination" | "onRequest" | "onUpdate:pagination">
>();

const columns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    name: "request-status",
    // FIXME: add field
    field: () => undefined,
    label: t("manageUsers.reservedBooksDialog.requestStatus"),
    align: "left",
  },
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
    format: (val: string) => startCase(toLower(val)),
  },
  {
    name: "subject",
    field: "subject",
    label: t("book.fields.subject"),
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    name: "title",
    field: "title",
    label: t("book.fields.title"),
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    name: "publisher",
    field: "publisherName",
    label: t("book.fields.publisher"),
    align: "left",
    format: (val: string) => startCase(toLower(val)),
  },
  {
    name: "price",
    field: "originalPrice",
    label: t("book.fields.price"),
    align: "left",
    format: (val: string) => formatPrice(val),
  },
  {
    name: "utility",
    //FIXME: add field
    field: () => undefined,
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
