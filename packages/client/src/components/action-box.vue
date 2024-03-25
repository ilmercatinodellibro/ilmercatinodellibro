<template>
  <div class="action-box column items-center justify-center">
    <slot>
      <p v-if="actionText" class="q-ma-none q-mb-lg text-h4 text-white">
        {{ actionText }}
      </p>
    </slot>
    <q-btn
      v-if="to"
      color="accent"
      :icon-right="mdiArrowRight"
      :label="buttonLabel"
      :to="to"
    />
    <q-btn
      v-else
      color="accent"
      :icon-right="mdiArrowRight"
      :label="buttonLabel"
      @click="emit('action-clicked')"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiArrowRight } from "@quasar/extras/mdi-v7";
import { RouteLocationRaw } from "vue-router";

defineProps<{
  buttonLabel: string;
  actionText?: string;
  to?: RouteLocationRaw;
}>();

const emit = defineEmits<{
  "action-clicked": [];
}>();
</script>

<style lang="scss" scoped>
.action-box {
  background-color: #798aa8;
  border-radius: 60px;
  box-sizing: border-box;
  overflow: hidden;
  margin: 12px;
  max-width: calc(100vw - 12px);
  min-height: 400px;
  padding: 48px 16px;
  width: 400px;
}
</style>
