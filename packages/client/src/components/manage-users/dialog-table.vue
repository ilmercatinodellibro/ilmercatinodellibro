<template>
  <q-table
    ref="tableRef"
    :columns="columns"
    :filter="searchQuery"
    :hide-pagination="hidePagination"
    :hide-bottom="hideBottom"
    :loading="loading"
    :pagination="pagination"
    :rows="rows"
    :rows-per-page-options="rowsPerPageOptions ?? ROWS_PER_PAGE_OPTIONS"
    class="full-height"
    flat
    square
    @request="onRequest"
    @update:pagination="$emit('update:pagination', $event)"
  >
    <template v-for="(_, slotName) in slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { QTable, QTableProps, QTableSlots } from "quasar";
import { computed, onMounted, ref } from "vue";

const tableRef = ref<QTable>();

const slots = defineSlots<QTableSlots>();

const hidePagination = computed(() =>
  props.pagination
    ? (props.pagination.rowsNumber ?? 0) < (props.pagination.rowsPerPage ?? 1)
    : true,
);

const props = defineProps<
  {
    searchQuery?: string;
  } & Pick<
    QTableProps,
    | "columns"
    | "hideBottom"
    | "loading"
    | "onRequest"
    | "pagination"
    | "rows"
    | "rowsPerPageOptions"
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
// This is the suggested way from Quasar docs; simply adding
// the css to the element doesn't work and there is no table
// property to make the thead sticky otherwise
:deep(thead) {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #fff;
}
</style>
