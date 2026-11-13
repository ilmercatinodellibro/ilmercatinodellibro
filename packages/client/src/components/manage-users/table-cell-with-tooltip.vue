<template>
  <q-td :key="keyTd">
    <span>
      <q-tooltip>
        {{ value }}
      </q-tooltip>
      {{ value }}
    </span>

    <slot />
  </q-td>
</template>

<script setup lang="ts">
import type { QTdKeyProps } from "./table-cell-key-props";

defineProps<QTdKeyProps & { value: string }>();
</script>
