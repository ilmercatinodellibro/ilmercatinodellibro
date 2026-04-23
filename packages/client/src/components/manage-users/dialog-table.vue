<template>
  <q-table
    ref="tableRef"
    v-model:pagination="pagination"
    :loading
    :rows="rows"
    :columns="columns"
    :hide-pagination="hidePagination"
    :row-key="rowKey as string"
    :rows-per-page-options="rowsPerPageOptions"
    class="full-height"
    flat
    square
    @request="onRequest"
  >
    <template v-for="(_, slotName) in filteredSlots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData"> </slot>
    </template>

    <template
      v-if="pagination?.page !== undefined"
      #pagination="slotData: PaginationScope"
    >
      <slot name="pagination" v-bind="slotData">
        <span class="q-pr-md">
          {{ currentPageLabel }}
        </span>

        <q-btn
          v-if="slotData.pagesNumber > 2"
          :disable="slotData.isFirstPage"
          :icon="mdiChevronDoubleLeft"
          color="grey-8"
          round
          dense
          flat
          @click="slotData.firstPage"
        />

        <q-btn
          :disable="slotData.isFirstPage"
          :icon="mdiChevronLeft"
          color="grey-8"
          round
          dense
          flat
          @click="slotData.prevPage"
        />

        <number-input
          v-if="slotData.pagesNumber > 2"
          :model-value="slotData.pagination.page"
          :disable="loading"
          :rules="[
            allowOnlyIntegerNumbers,
            numberBetween(1, slotData.pagesNumber),
          ]"
          dense
          outlined
          @update:model-value="updatePagination"
        />

        <q-btn
          :disable="slotData.isLastPage"
          :icon="mdiChevronRight"
          color="grey-8"
          round
          dense
          flat
          @click="slotData.nextPage"
        />

        <q-btn
          v-if="slotData.pagesNumber > 2"
          :disable="slotData.isLastPage"
          :icon="mdiChevronDoubleRight"
          color="grey-8"
          round
          dense
          flat
          @click="slotData.lastPage"
        />
      </slot>
    </template>
  </q-table>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import {
  mdiChevronDoubleLeft,
  mdiChevronDoubleRight,
  mdiChevronLeft,
  mdiChevronRight,
} from "@quasar/extras/mdi-v7";
import { omit } from "lodash-es";
import { QTable, QTableColumn, QTableProps, QTableSlots } from "quasar";
import { computed, onMounted, ref, type Slot } from "vue";
import { useI18n } from "vue-i18n";
import NumberInput from "src/components/manage-users/number-input.vue";
import { allowOnlyIntegerNumbers, numberBetween } from "src/helpers/rules";

withDefaults(
  defineProps<
    {
      rows: readonly T[];
      columns?: QTableColumn<T>[];
      rowKey?: Extract<keyof T, string>;
    } & Pick<QTableProps, "loading" | "rowsPerPageOptions" | "onRequest">
  >(),
  {
    columns: undefined,
    rowKey: undefined,
    rowsPerPageOptions: () => [0],
  },
);

type PaginationScope =
  QTableSlots["pagination"] extends Slot<infer Scope> ? Scope : never;

const pagination =
  defineModel<NonNullable<QTableProps["pagination"]>>("pagination");

onMounted(() => {
  tableRef.value?.requestServerInteraction();
});

const slots = defineSlots<QTableSlots>();

const filteredSlots = omit(slots, "pagination");

const { t } = useI18n();

const currentPageLabel = computed(() => {
  if (
    pagination.value?.page === undefined ||
    pagination.value.rowsNumber === undefined ||
    pagination.value.rowsPerPage === undefined
  ) {
    return;
  }

  const { rowsNumber, rowsPerPage, page } = pagination.value;

  const currentPageStart = (page - 1) * rowsPerPage;

  return `${currentPageStart + 1}-${Math.min(
    currentPageStart + rowsPerPage,
    rowsNumber,
  )} ${t("common.of").toLowerCase()} ${rowsNumber}`;
});

const hidePagination = computed(() =>
  pagination.value
    ? (pagination.value.rowsNumber ?? 0) <= (pagination.value.rowsPerPage ?? 1)
    : true,
);

const tableRef = ref<QTable>();

function updatePagination(newPage: number) {
  if (!pagination.value || !tableRef.value) {
    return;
  }

  pagination.value.page = newPage;

  if (pagination.value.rowsNumber === undefined) {
    return;
  }
  tableRef.value.requestServerInteraction();
}
</script>

<style lang="scss">
.sticky-last-column {
  tr:last-child th:last-child,
  td:last-child {
    background-color: #fff;
    border-left: 1px solid rgba(0 0 0 / 12%);
    position: sticky;
    right: 0;
    z-index: 1;
  }
}
</style>

<style scoped lang="scss">
// This is the suggested way from Quasar docs; simply adding
// the css to the element doesn't work and there is no table
// property to make the thead sticky otherwise
:deep(thead) {
  position: sticky;
  z-index: 2;
  top: 0;
  background-color: #fff;
}
</style>
