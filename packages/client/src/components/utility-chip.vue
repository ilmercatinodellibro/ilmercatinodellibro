<template>
  <q-chip
    square
    :ripple="false"
    :color="data.color"
    :dark="data.color !== 'warning'"
    class="line-height-16 text-size-14 text-weight-medium utility-chip"
    dense
  >
    {{ $t(`book.utility.${data.label}`) }}

    <q-tooltip class="white-space-pre-wrap">
      {{
        $t("book.utilityTooltip", {
          warehouse: utility.booksInWarehouse,
          all: utility.booksTaken,
          sold: utility.booksSold,
          requestsActive: utility.requestsActive,
          requestsTotal: utility.requestsTotal,
          utilityIndex: utility.value.toFixed(2),
        })
      }}
    </q-tooltip>
  </q-chip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BookUtility } from "src/@generated/graphql";

const UTILITY_LOW_THRESHOLD = 0.4;
const UTILITY_HIGH_THRESHOLD = 1;

const props = defineProps<{
  utility: BookUtility;
}>();

interface ColorChipData {
  color: "negative" | "warning" | "positive";
  label: "low" | "medium" | "high";
}

const data = computed<ColorChipData>(() =>
  props.utility.value <= UTILITY_LOW_THRESHOLD
    ? { color: "negative", label: "low" }
    : props.utility.value <= UTILITY_HIGH_THRESHOLD
      ? { color: "warning", label: "medium" }
      : { color: "positive", label: "high" },
);
</script>

<style scoped lang="scss">
.utility-chip {
  text-transform: uppercase;
  user-select: none;
}
</style>
