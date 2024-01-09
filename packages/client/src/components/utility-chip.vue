<template>
  <q-chip
    square
    :ripple="false"
    :color="colorFromValue(value ?? 0).color"
    :dark="colorFromValue(value ?? 0).color !== 'yellow'"
    class="line-height-16 text-size-14 utility-chip"
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

function colorFromValue(value: number) {
  return value < UTILITY_LOW_THRESHOLD
    ? { color: "red", label: "low" }
    : value < UTILITY_HIGH_THRESHOLD
    ? { color: "yellow", label: "medium" }
    : { color: "green", label: "high" };
}
</script>

<style scoped lang="scss">
.utility-chip {
  text-transform: uppercase;
  user-select: none;
}
</style>
