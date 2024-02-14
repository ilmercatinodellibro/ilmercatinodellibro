<!-- The goal of this component is to just wrap the q-select and avoid assign null value -->
<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    @update:model-value="onUpdateModelValue"
  >
    <!-- Carry over all the slots -->
    <template v-for="(_, name) in slots" #[name]="slotData">
      <!-- Due to an unknown reason, Volar complains here, so we cast slotData to any below -->
      <slot :name="name" v-bind="/* prettier-ignore */(slotData as any)" />
    </template>

    <template #no-option>
      <q-item>
        <q-item-section class="text-black-54">{{
          t("general.noResults")
        }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { QSelectSlots } from "quasar";
import { useI18n } from "vue-i18n";

interface Props {
  // TODO: Use component generics (<script ... generic="T">)
  modelValue: string | string[] | number | Record<string, unknown>;
  options?: readonly unknown[];
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
});

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "update:modelValue": [value: any];
}>();

const slots = defineSlots<QSelectSlots>();

const { t } = useI18n();

function onUpdateModelValue(newVal: typeof props.modelValue | null) {
  if (newVal !== null) {
    emit("update:modelValue", newVal);
  }
}
</script>
