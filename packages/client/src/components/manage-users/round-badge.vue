<template>
  <q-badge
    :class="positionClass"
    class="flex-center height-24 round text-body1 text-weight-regular width-24"
  >
    <slot />
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ floatLeft?: boolean; floatLeftSquare?: boolean }>();

const positionClass = computed(() =>
  props.floatLeft
    ? "top-left"
    : props.floatLeftSquare
    ? "top-left--square"
    : undefined,
);
</script>

<style scoped lang="scss">
.top-left {
  left: -8px;
  position: absolute;
  top: 0;

  // Make q-badge float to the top left of square button
  &--square {
    left: -8px;
    position: absolute;
    top: -8px;
  }
}
</style>
