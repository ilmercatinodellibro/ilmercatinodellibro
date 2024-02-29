<template>
  <q-chip
    square
    :ripple="false"
    :color="colorFromValue(value ?? 0).color"
    :dark="colorFromValue(value ?? 0).color !== 'warning'"
    class="line-height-16 text-size-14 text-weight-medium utility-chip"
    dense
  >
    {{ $t(`book.utility.${colorFromValue(value ?? 0).label}`) }}
  </q-chip>
</template>

<script setup lang="ts">
const UTILITY_LOW_THRESHOLD = 0.33;
const UTILITY_HIGH_THRESHOLD = 0.66;

defineProps<{
  value?: number;
}>();

interface ColorChipData {
  color: "negative" | "warning" | "positive";
  label: "low" | "medium" | "high";
}

function colorFromValue(value: number): ColorChipData {
  return value < UTILITY_LOW_THRESHOLD
    ? { color: "negative", label: "low" }
    : value < UTILITY_HIGH_THRESHOLD
    ? { color: "warning", label: "medium" }
    : { color: "positive", label: "high" };
}
</script>

<style scoped lang="scss">
.utility-chip {
  text-transform: uppercase;
  user-select: none;
}
</style>
