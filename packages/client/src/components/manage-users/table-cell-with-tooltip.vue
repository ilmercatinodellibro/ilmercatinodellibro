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
import { QTdKeyProp } from "./table-cell-key-prop";

defineProps<QTdKeyProp & { value: string }>();
</script>
