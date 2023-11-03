<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card size="sm" :title="title">
      <q-card-section class="q-px-none">
        <q-item v-for="(option, id) in options" :key="id" v-ripple tag="label">
          <q-item-section side top>
            <component
              :is="useCheckBoxes ? QCheckbox : QRadio"
              v-model="modelValue"
              keep-color
              color="secondary"
              :val="option.value"
            />
          </q-item-section>

          <q-item-section class="text-dark">
            <q-item-label>{{ option.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-separator />
      <template #card-actions>
        <q-btn
          :label="closeLabel || t('common.cancel')"
          color="dark"
          flat
          @click="onDialogCancel"
        />
        <q-btn
          :disable="
            !useCheckBoxes &&
            (modelValue === undefined ||
              (typeof modelValue === 'string' && modelValue.length === 0))
          "
          :label="confirmLabel || t('common.save')"
          color="dark"
          flat
          @click="onDialogOK(modelValue)"
        />
      </template>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { isArray } from "lodash-es";
import {
  QCheckbox,
  QRadio,
  QSelectOption,
  useDialogPluginComponent,
} from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import KDialogFormCard from "./k-dialog-form-card.vue";

interface ListDialogProps<T = unknown> {
  options: QSelectOption<T>[];
  initialModelValue?: T | T[];
  title?: string;
  closeLabel?: string;
  confirmLabel?: string;
}

const { t } = useI18n();

defineEmits(useDialogPluginComponent.emits);

const props = withDefaults(defineProps<ListDialogProps>(), {
  initialModelValue: undefined,
  maxHeight: "unset",
  maxWidth: "unset",
  title: undefined,
  closeLabel: undefined,
  confirmLabel: undefined,
});

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent<ListDialogProps["initialModelValue"]>();

const modelValue = ref<unknown>(props.initialModelValue);

const useCheckBoxes = computed(() => isArray(modelValue.value));
</script>

<style lang="scss" scoped>
.scroll-area-container {
  height: 200px;
}
</style>
