<template>
  <q-input
    v-model="password"
    :rules="rules"
    :type="!showPassword ? 'password' : 'text'"
    :label="label"
  >
    <template v-for="(_, slotName) in slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>
    <template #append>
      <q-icon
        :name="!showPassword ? mdiEyeOff : mdiEye"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { mdiEye, mdiEyeOff } from "@quasar/extras/mdi-v7";
import { QInput, type ValidationRule } from "quasar";

type Slots = QInput["$slots"];

defineProps({
  rules: {
    type: Array<ValidationRule>,
    default: [],
  },
  label: {
    type: String,
    required: true,
  },
});

const slots = defineSlots<Slots>();

const password = defineModel<string>();
const showPassword = defineModel<boolean>("show", { default: false });
</script>
