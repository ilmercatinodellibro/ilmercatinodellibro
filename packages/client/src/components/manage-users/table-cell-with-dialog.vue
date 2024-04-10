<template>
  <q-td>
    <span v-if="value <= 0 && !clickableWhenZero" class="text-body2">
      {{ value }}
    </span>
    <q-btn v-else square flat class="absolute-full">
      <span
        :class="{
          'text-underline': value > 0,
          'full-width': !secondaryValue,
        }"
        class="text-body2 text-left"
      >
        {{ value }}
      </span>

      <template v-if="!!secondaryValue">
        <q-space />

        <slot name="secondary-value" v-bind="{ value: secondaryValue }">
          <round-badge color="positive">
            {{ secondaryValue }}
          </round-badge>
        </slot>
      </template>
    </q-btn>
  </q-td>
</template>

<script setup lang="ts">
import RoundBadge from "./round-badge.vue";

defineProps<{
  value: number;
  secondaryValue?: number;
  clickableWhenZero?: boolean;
}>();
</script>
