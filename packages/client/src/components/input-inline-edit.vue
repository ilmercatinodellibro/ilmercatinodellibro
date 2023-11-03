<template>
  <q-input
    ref="inputRef"
    v-bind="props"
    :class="showOutlines ? '' : 'q-px-12px'"
    :outlined="showOutlines"
    :standout="false"
    borderless
    class="light-borders"
    @blur="isInEditMode = false"
    @focus="onInputFocus"
  >
    <template v-for="(_, slotName) in slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>

    <template #append>
      <q-icon
        v-if="!isInEditMode"
        :name="mdiPencil"
        class="cursor-pointer"
        color="black-87"
        @click="forceInputElementFocus"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { mdiPencil } from "@quasar/extras/mdi-v7";
import { QInput, QInputProps, QInputSlots } from "quasar";
import { Ref, computed, ref } from "vue";

// eslint-disable-next-line vue/prop-name-casing, vue/no-unused-properties -- we bind all props, but vue-eslint isn't able to recognize it
const props = withDefaults(defineProps<QInputProps>(), {
  dense: true,
});

// TODO: add a dummy slot to avoid vue-tsc triggering TS errors
// See https://github.com/vuejs/language-tools/issues/3216
const slots = defineSlots<QInputSlots & { dummy: (scope: string) => void }>();

const inputRef = ref() as Ref<QInput>;

const isInEditMode = ref(false);

const showOutlines = computed(
  () =>
    isInEditMode.value ||
    props.modelValue === null ||
    props.modelValue === undefined ||
    (typeof props.modelValue === "string" && props.modelValue.length === 0),
);

function onInputFocus() {
  inputRef.value.select();
  isInEditMode.value = true;
}

function forceInputElementFocus() {
  inputRef.value.focus();
}
</script>

<style scoped lang="scss">
// Used to avoid resize when changing to borderless or bordered input mode
.q-px-12px {
  padding-left: 12px;
  padding-right: 12px;
}
</style>

<style lang="scss">
.light-borders {
  // Sets the outline to a lighter color
  .q-field__control::before {
    border-color: rgba(0 0 0 / 24%) !important;
  }

  // Removes the standout outline only if not in error mode
  &:not(.q-field--error) {
    /* stylelint-disable-next-line max-nesting-depth */
    .q-field__control::after {
      content: none;
    }
  }
}
</style>
