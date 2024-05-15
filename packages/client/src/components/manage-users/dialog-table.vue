<template>
  <q-table
    ref="tableRef"
    :rows="rows"
    :columns="columns"
    :filter="searchQuery"
    :hide-pagination="hidePagination"
    :pagination="{
      ...pagination,
      rowsPerPage: hidePagination ? 0 : pagination?.rowsPerPage,
    }"
    :row-key="rowKey as string"
    :rows-per-page-options="rowsPerPageOptions"
    class="full-height"
    flat
    square
    @request="props.onRequest"
    @update:pagination="props['onUpdate:pagination']"
  >
    <template v-for="(_, slotName) in slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>
  </q-table>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { QTable, QTableColumn, QTableProps, QTableSlots } from "quasar";
import { computed, onMounted, ref } from "vue";

const tableRef = ref<QTable>();

const slots = defineSlots<QTableSlots>();

const hidePagination = computed(() =>
  props.pagination
    ? (props.pagination.rowsNumber ?? 0) <= (props.pagination.rowsPerPage ?? 1)
    : true,
);

const props = withDefaults(
  defineProps<
    {
      searchQuery?: string;
      rows: readonly T[];
      columns?: QTableColumn<T>[];
      rowKey?: Extract<keyof T, string>;
      // eslint-disable-next-line vue/prop-name-casing, vue/no-unused-properties
    } & Pick<
      QTableProps,
      "pagination" | "rowsPerPageOptions" | "onRequest" | "onUpdate:pagination"
    >
  >(),
  {
    searchQuery: undefined,
    columns: undefined,
    rowKey: undefined,
    rowsPerPageOptions: () => [5, 10, 20, 50, 100, 200],
  },
);

onMounted(() => {
  tableRef.value?.requestServerInteraction();
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
