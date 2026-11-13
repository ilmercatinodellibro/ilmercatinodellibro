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
import type { QTdKeyProp as QTdKeyProperty } from "./table-cell-key-prop";

defineProps<QTdKeyProperty & { value: string }>();
</script>
