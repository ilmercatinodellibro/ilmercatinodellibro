<template>
  <q-td class="text-left">
    <q-btn v-if="value > 0" square flat class="absolute-full row">
      <span
        class="col items-center justify-between row text-underline text-weight-regular"
      >
        {{ value }}
      </span>
      <q-icon
        v-if="showAlert"
        class="col"
        color="green"
        name="mdi-alert-circle"
      />
    </q-btn>
    <span v-else class="text-body2">
      {{ value }}
    </span>
  </q-td>
</template>

<script setup lang="ts">
defineProps<{
  value: number;
  showAlert?: boolean;
}>();
</script>
