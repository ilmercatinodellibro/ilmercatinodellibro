<template>
  <!--
    Displaying errors would break the UI, so we prevent
    invalid input instead and we don't show any error message
  -->
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

// To prevent invalid values while typing, deleting, or pasting,
// we compute the new value before it is applied to the input's value
// This requires managing partial or total text selection and replacement
const validate: HTMLInputElement["onbeforeinput"] = (event) => {
  if (!inputRef.value || !event.target) {
    return;
  }

  const target = event.target as HTMLInputElement;
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? target.value.length;

  // In case the user is deleting, check if at least one digit remains
  // If not, prevent the deletion altogether to avoid empty values
  if (event.data === null) {
    if (target.value.length - (end - start) > 1) {
      return;
    }

    event.preventDefault();
    return;
  }

  const newValue =
    target.value.substring(0, start) + event.data + target.value.substring(end);

  const doesNotSatisfyRules = props.rules?.some(
    (rule) =>
      typeof rule === "function" &&
      rule(
        newValue,
        {} as Record<EmbeddedValidationRule, EmbeddedValidationRuleFn>,
      ) !== true,
  );

  // If the new value does not respect rules validation or if the input
  // is not a plain text positive integer, prevent the change
  const isInvalidNumber = isNaN(Number(newValue)) || !/^\d+$/.test(newValue);
  if (doesNotSatisfyRules || isInvalidNumber) {
    event.preventDefault();

    return;
  }
};
</script>
