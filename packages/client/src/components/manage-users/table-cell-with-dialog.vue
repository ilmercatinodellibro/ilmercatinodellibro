<template>
  <q-td class="text-left">
    <q-btn v-if="value > 0" square flat class="absolute-full row">
      <span
        class="col flex items-center justify-between justify-start q-pa-none row text-body2 text-underlined text-weight-regular"
      >
        {{ value }}
      </span>
      <q-icon
        v-if="showAlert"
        class="col-shrink"
        color="green"
        name="mdi-alert-circle"
        size="24px"
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

<style scoped lang="scss">
.text-underlined {
  text-decoration: underline;
}
</style>
