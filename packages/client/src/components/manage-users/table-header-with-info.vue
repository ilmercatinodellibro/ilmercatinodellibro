<template>
  <q-th class="text-left">
    {{ label }}
    <q-btn
      class="q-pa-none"
      color="black-54"
      dense
      flat
      icon="mdi-information-outline"
      round
      size="sm"
    >
      <q-tooltip>
        {{ info }}
      </q-tooltip>
    </q-btn>
  </q-th>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  info: string;
}>();
</script>
