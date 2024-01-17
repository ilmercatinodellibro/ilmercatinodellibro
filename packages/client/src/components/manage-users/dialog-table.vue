<template>
  <q-table
    ref="tableRef"
    :pagination="pagination"
    :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
    class="col"
    flat
    square
    :rows="rows"
    :columns="columns"
    :filter="searchQuery"
    :loading="loading"
    :hide-pagination="
      pagination
        ? (pagination.rowsNumber ?? 0) < (pagination.rowsPerPage ?? 1)
        : true
    "
    @request="onRequest"
    @update:pagination="$emit('update:pagination', $event)"
  >
    <template v-for="(_, slotName) in slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { QTable, QTableProps } from "quasar";
import { onMounted, ref } from "vue";

type Slots = QTable["$slots"];

const tableRef = ref<QTable>();

const slots = defineSlots<Slots>();

defineProps<
  {
    searchQuery?: string;
  } & Pick<
    QTableProps,
    "rows" | "columns" | "pagination" | "loading" | "onRequest"
  >
>();

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200];

onMounted(() => {
  tableRef.value?.requestServerInteraction();
});

defineEmits({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  "update:pagination": (newPagination: QTableProps["pagination"]) => true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: (requestProp: {
    pagination: {
      sortBy: string;
      descending: boolean;
      page: number;
      rowsPerPage: number;
    };
    filter?: unknown;
    getCellValue: (col: unknown, row: unknown) => unknown;
  }) => true,
});
</script>

<style scoped lang="scss">
:deep(thead) {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #fff;
}
</style>
