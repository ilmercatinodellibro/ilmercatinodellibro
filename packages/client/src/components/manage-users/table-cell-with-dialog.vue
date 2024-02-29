<template>
  <q-td>
    <q-btn v-if="value > 0" square flat class="absolute-full">
      <span class="text-underline text-weight-regular">
        {{ value }}
      </span>
      <q-space />
      <round-badge v-if="secondaryValue" color="positive">
        {{ secondaryValue }}
        <q-tooltip>
          {{ $t("manageUsers.availableTooltip") }}
        </q-tooltip>
      </round-badge>
    </q-btn>
    <span v-else class="text-body2">
      {{ value }}
    </span>
  </q-td>
</template>

<script setup lang="ts">
import RoundBadge from "./round-badge.vue";

defineProps<{
  value: number;
  secondaryValue?: number;
}>();
</script>
