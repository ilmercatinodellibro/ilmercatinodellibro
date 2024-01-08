<template>
  <q-card-section class="col flex q-pb-none q-px-none">
    <q-table
      class="col"
      flat
      square
      :rows="rows"
      :columns="columns"
      :filter="searchQuery"
      :loading="loading"
    >
      <template v-for="(_, slotName) in slots" #[slotName]="{ slotData }">
        <slot :name="slotName" v-bind="slotData" />
      </template>
    </q-table>
  </q-card-section>
</template>

<script setup lang="ts">
import { QTable, QTableProps } from "quasar";

type Slots = QTable["$slots"];

const slots = defineSlots<Slots>();

defineProps<
  {
    searchQuery?: string;
    loading?: boolean;
  } & Pick<QTableProps, "rows" | "columns">
>();
</script>

<style scoped lang="scss">
:deep(thead) {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #fff;
}
</style>
