<template>
  <q-btn flat :icon="mdiFilter" round @click="openHeaderFiltersDialog">
    <q-badge
      v-if="isModelValueEmpty"
      color="secondary"
      rounded
      floating
      class="header-filter-badge"
    />
  </q-btn>
</template>

<script
  generic="
    TOptionValue extends unknown,
    TModelValue extends HeaderFilterModel<TOptionValue>
  "
  setup
  lang="ts"
>
import { mdiFilter } from "@quasar/extras/mdi-v7";
import { isArray } from "lodash-es";
import { Dialog, QSelectOption } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { HeaderFilterModel } from "src/composables/header-features/use-header-filters";
import FiltersDialog from "./filters-dialog.vue";

const props = defineProps<{
  filterOptions: QSelectOption<TOptionValue>[];
  compareFunction?: (value1: TOptionValue, value2: TOptionValue) => boolean;
}>();

const { t } = useI18n();

const modelValueProxy = defineModel<TModelValue>({
  required: true,
});

const isModelValueEmpty = computed(
  () =>
    modelValueProxy.value === undefined ||
    (isArray(modelValueProxy.value) && modelValueProxy.value.length > 0),
);

function openHeaderFiltersDialog() {
  Dialog.create({
    component: FiltersDialog,
    componentProps: {
      title: t("general.filters"),
      options: props.filterOptions,
      initialModel: modelValueProxy.value,
      compareFunction: props.compareFunction,
    },
  }).onOk((newValue: TModelValue) => {
    modelValueProxy.value = newValue;
  });
}
</script>

<style scoped lang="scss">
.header-filter-badge {
  font-size: 8px;
  line-height: 8px;
  min-height: 8px;
  padding: 1px 4px;
  right: 7px;
  top: 7px;
}
</style>
