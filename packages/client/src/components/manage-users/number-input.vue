<template>
  <q-input
    ref="inputRef"
    v-bind="props"
    :model-value
    :onbeforeinput="validate"
    :size="modelValue.toString().length"
    input-class="text-center"
    inputmode="numeric"
    hide-bottom-space
    @focus="inputRef?.select()"
    @keydown.enter="
      ({ target }: InputEvent) =>
        (modelValue = Number((target as HTMLInputElement).value))
    "
  />
</template>

<script setup lang="ts">
import {
  QInput,
  QInputProps,
  type EmbeddedValidationRule,
  type EmbeddedValidationRuleFn,
} from "quasar";
import { ref } from "vue";

const modelValue = defineModel<number>({ required: true });

const props =
  defineProps<Omit<QInputProps, "modelValue" | "onUpdate:modelValue">>();

const inputRef = ref<QInput>();

const validate: HTMLInputElement["onbeforeinput"] = (event) => {
  if (!inputRef.value || !event.target) {
    return;
  }

  const target = event.target as HTMLInputElement;
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? target.value.length;

  if (event.data === null) {
    if (target.value.length - (end - start) > 1) {
      return;
    }

    event.preventDefault();
    return;
  }

  const newValue =
    target.value.substring(0, start) + event.data + target.value.substring(end);

  const isInvalid = props.rules?.some(
    (rule) =>
      typeof rule === "function" &&
      rule(
        newValue,
        {} as Record<EmbeddedValidationRule, EmbeddedValidationRuleFn>,
      ) !== true,
  );

  if (isInvalid || event.data !== parseInt(event.data).toString()) {
    event.preventDefault();

    return;
  }
};
</script>
