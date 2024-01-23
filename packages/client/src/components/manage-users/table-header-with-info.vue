<template>
  <q-th class="text-left">
    {{ label }}
    <q-icon
      class="q-ml-sm"
      color="black-54"
      :name="mdiInformationOutline"
      size="xs"
    >
      <q-tooltip>
        {{ info }}
      </q-tooltip>
    </q-icon>
  </q-th>
</template>

<script setup lang="ts">
import { mdiInformationOutline } from "@quasar/extras/mdi-v7";

defineProps<{
  label: string;
  info: string;
}>();
</script>
