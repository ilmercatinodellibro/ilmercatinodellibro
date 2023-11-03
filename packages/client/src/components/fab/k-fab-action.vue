<template>
  <q-fab-action class="k-fab-action" v-bind="props" />
</template>

<script setup lang="ts">
import { QFabAction, QFabActionProps } from "quasar";

// eslint-disable-next-line vue/no-unused-properties
const props = withDefaults(defineProps<QFabActionProps>(), {
  color: "accent",
  textColor: "black-54",
  labelPosition: "left",
  padding: "md",
  type: "button",
});
</script>
