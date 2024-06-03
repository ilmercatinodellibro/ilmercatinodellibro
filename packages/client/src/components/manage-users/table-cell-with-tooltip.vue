<template>
  <q-td>
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
defineProps<{ value: string }>();
</script>
