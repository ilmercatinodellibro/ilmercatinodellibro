<template>
  <q-td class="text-left">
    <q-btn v-if="value > 0" square flat stretch class="absolute-full">
      <span
        class="col items-center justify-between row text-underline text-weight-regular"
      >
        {{ value }}
      </span>
      <q-icon v-if="showAlert" color="green" :name="mdiAlertCircle" />
    </q-btn>
    <span v-else class="text-body2">
      {{ value }}
    </span>
  </q-td>
</template>

<script setup lang="ts">
import { mdiAlertCircle } from "@quasar/extras/mdi-v7";

defineProps<{
  value: number;
  showAlert?: boolean;
}>();
</script>
