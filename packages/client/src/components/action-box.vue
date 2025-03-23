<template>
  <div
    class="action-box bg-primary column items-center justify-center min-height-200 min-width-250 no-wrap q-px-md q-py-xl"
  >
    <slot>
      <p v-if="actionText" class="q-ma-none q-mb-lg text-h4 text-white">
        {{ actionText }}
      </p>
    </slot>

    <q-btn
      v-if="to"
      :icon-right="mdiArrowRight"
      :label="buttonLabel"
      :to="to"
      color="accent"
      no-wrap
    />
    <q-btn
      v-else
      :icon-right="mdiArrowRight"
      :label="buttonLabel"
      color="accent"
      no-wrap
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
// This class is also used by parent components to define the width and height from outside
.action-box {
  border-radius: 60px;
}
</style>
