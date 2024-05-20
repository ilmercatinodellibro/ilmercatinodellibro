<template>
  <q-td>
    <q-tooltip>
      {{ value }}
    </q-tooltip>
    {{ value }}
  </q-td>
</template>

<script setup lang="ts">
defineProps<{ value: string }>();
</script>
