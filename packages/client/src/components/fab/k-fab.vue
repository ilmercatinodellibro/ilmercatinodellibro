<template>
  <q-fab
    v-model="isFabExpanded"
    class="k-fab"
    :class="{ 'k-fab--sticky': props.sticky }"
    v-bind="props"
    :color="
      props.color !== undefined
        ? props.color
        : isFabExpanded
        ? 'secondary'
        : 'accent'
    "
  >
    <template v-for="(_, name) in slots" #[name]="slotData">
      <!-- Due to an unknown reason, Volar complains here, so we cast slotData to any below -->
      <!-- `?? {}` is required to avoid an app-breaking error - https://github.com/vuejs/core/issues/7713 -->
      <slot :name="name" v-bind="slotData ?? ({} as any)" />
    </template>
  </q-fab>
</template>

<script setup lang="ts">
import { mdiChevronUp } from "@quasar/extras/mdi-v7";
import { QFabProps, QFabSlots } from "quasar";
import { ref } from "vue";

// eslint-disable-next-line vue/no-unused-properties
type Props = Omit<QFabProps, "modelValue" | "onUpdate:modelValue"> & {
  // eslint-disable-next-line vue/no-unused-properties
  sticky?: boolean;
};
const props = withDefaults(defineProps<Props>(), {
  color: undefined,
  textColor: "black-54",
  icon: mdiChevronUp,
  direction: "up",
  labelPosition: "left",
  type: "button",
});

const slots = defineSlots<QFabSlots>();

const isFabExpanded = ref(false);
</script>

<style lang="scss" scoped>
.k-fab {
  // TODO: Add other positions if needed
  &--sticky {
    $fab-bottom-margin: 16px;
    $fab-side-margin: 16px;
    $fab-width: calc(100% - #{$fab-side-margin * 2});

    bottom: $fab-bottom-margin;
    left: $fab-side-margin;
    position: fixed;
    width: $fab-width;
  }

  :deep(.q-fab__actions) {
    left: 0;
    margin-left: 0;
    width: 100%;

    /* stylelint-disable-next-line max-nesting-depth */
    .k-fab-action {
      width: 95%;
    }
  }

  :deep(.q-fab__icon-holder),
  // Applying :deep to .k-fab-action as well since it's passed as part of the slot
  :deep(.k-fab-action .q-fab__label + .q-icon, .q-fab__label + img) {
    position: absolute;
    right: 24px;
  }
}
</style>
