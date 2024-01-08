<template>
  <q-chip
    square
    :ripple="false"
    :color="colorFromValue(value).color"
    :dark="colorFromValue(value).color !== 'yellow'"
    class="utility-chip"
  >
    {{ $t(`book.utility.${colorFromValue(value).label}`) }}
  </q-chip>
</template>

<script setup lang="ts">
const UTILITY_LOW_THRESHOLD = 0.33;
const UTILITY_HIGH_THRESHOLD = 0.66;

defineProps<{
  value: "red" | "yellow" | "green";
}>();

function colorFromValue(value: string) {
  return parseFloat(value) < UTILITY_LOW_THRESHOLD
    ? { color: "red", label: "low" }
    : parseFloat(value) < UTILITY_HIGH_THRESHOLD
    ? { color: "yellow", label: "medium" }
    : { color: "green", label: "high" };
}
</script>
