<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="title"
      size="sm"
      @submit="onSubmit(selectedFilters)"
    >
      <q-item v-for="(option, index) in options" :key="index" tag="label">
        <q-item-section side>
          <component
            :is="isMultiSelection ? QCheckbox : QRadio"
            v-model="selectedFilters"
            :val="option.value"
            color="secondary"
            keep-color
          />
        </q-item-section>

        <q-item-section>
          {{ option.label }}
        </q-item-section>
      </q-item>

      <template #card-actions="{ uniqueFormId }">
        <q-btn
          v-if="isMultiSelection"
          outline
          color="black-12"
          @click="removeFilters"
        >
          <span class="text-black">{{ t("actions.removeFilters") }}</span>
        </q-btn>

        <q-space />

        <q-btn :label="t('common.cancel')" flat @click="onDialogCancel" />
        <q-btn
          :disable="selectedFilters === undefined"
          :form="uniqueFormId"
          :label="t('common.confirm')"
          flat
          type="submit"
        />
      </template>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script generic="TOptionValue = any" setup lang="ts">
import { cloneDeep, isArray } from "lodash-es";
import {
  Notify,
  QCheckbox,
  QRadio,
  QSelectOption,
  useDialogPluginComponent,
} from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { HeaderFilterModel } from "src/composables/header-features/use-header-filters";
import KDialogFormCard from "./k-dialog-form-card.vue";

interface HeaderFiltersProps {
  title: string;
  options: QSelectOption<TOptionValue>[];
  initialModel: HeaderFilterModel<TOptionValue>;
  compareFunction?: (value1: TOptionValue, value2: TOptionValue) => boolean;
}

const props = withDefaults(defineProps<HeaderFiltersProps>(), {
  // We need the filter function because the values can be complex (ex: objects)
  compareFunction: (a, b) => a === b,
});

defineEmits(useDialogPluginComponent.emits);

const { t } = useI18n();

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent<HeaderFilterModel<TOptionValue>>();

const clonedInitialModel = cloneDeep(props.initialModel);

const isMultiSelection = isArray(clonedInitialModel);

const selectedFilters = ref(
  // We must remap the model based on the used options otherwise the inner QCheckbox/QRadio validation would not recognize the selected values
  isMultiSelection
    ? props.options
        .filter(({ value: optionValue }) =>
          clonedInitialModel.find(({ value }) =>
            props.compareFunction(optionValue, value),
          ),
        )
        .map(({ value }) => value)
    : clonedInitialModel?.value,
);

function removeFilters() {
  if (isMultiSelection) {
    onDialogOK([]);
  } else {
    throw new Error("You can't reset a single selection");
  }
}

function onSubmit(filterValuesToSubmit: unknown) {
  if (filterValuesToSubmit !== undefined) {
    const filtersToReturn = isArray(filterValuesToSubmit)
      ? props.options.filter(({ value: optionValue }) =>
          filterValuesToSubmit.some(
            (filterValue) => filterValue === optionValue,
          ),
        )
      : props.options.find(({ value }) => value === filterValuesToSubmit);

    onDialogOK(filtersToReturn);
  } else {
    Notify.create({
      message: t("actions.selectAtLeastOneOption"),
      color: "secondary",
      textColor: "primary",
      badgeColor: "accent",
      badgeTextColor: "primary-54",
      timeout: 500,
    });
  }
}
</script>
