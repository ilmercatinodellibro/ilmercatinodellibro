<template>
  <q-icon
    :name="value ? mdiCheckCircle : mdiCancel"
    :color="value ? 'green' : 'red'"
    class="q-mr-md"
    size="24px"
  />
  <span>
    {{ $t("book.availability." + (value ? "available" : "notAvailable")) }}
  </span>
</template>

<script setup lang="ts">
import { mdiCancel, mdiCheckCircle } from "@quasar/extras/mdi-v7";

defineProps<{
  value: boolean;
}>();
</script>
