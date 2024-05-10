<template>
  <q-card-section class="full-width gap-16 items-center q-pa-md row">
    <q-input
      :model-value="newFilters.searchQuery"
      :placeholder="t('common.search')"
      class="col max-width-600"
      clearable
      debounce="400"
      outlined
      type="search"
      @update:model-value="(query) => updateSearch(query as string)"
    >
      <template v-if="newFilters.searchQuery.length === 0" #append>
        <q-icon :name="mdiMagnify" />
      </template>
    </q-input>

    <q-select
      :label="t('book.filter')"
      :model-value="newFilters.filters"
      :options="Object.keys(filterOptions)"
      :display-value="selectedFiltersDisplay"
      class="width-200"
      clearable
      multiple
      outlined
      @update:model-value="updateFilters"
    >
      <template #option="{ itemProps, opt, selected, toggleOption }">
        <q-item v-bind="itemProps">
          <q-item-section side top>
            <q-checkbox
              :model-value="selected"
              @update:model-value="toggleOption(opt)"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label> {{ filterOptions[opt] }} </q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template v-if="newFilters.schoolFilters" #after-options>
        <q-item
          clickable
          @click="openSchoolFilterDialog(newFilters.schoolFilters)"
        >
          <q-item-section>
            {{ t("book.filters.school") }}
          </q-item-section>

          <q-item-section v-if="isSchoolFilterSelected" side>
            <q-btn
              dense
              flat
              round
              :icon="mdiCloseCircle"
              @click.stop="clearSchoolFiltersFilters"
            />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <span class="col gap-16 items-center justify-end no-padding row">
      <slot name="side-actions" />
    </span>
  </q-card-section>
</template>

<script setup lang="ts">
import { mdiCloseCircle, mdiMagnify } from "@quasar/extras/mdi-v7";
import { cloneDeep } from "lodash-es";
import { Dialog } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTranslatedFilters } from "src/composables/use-filter-translations";
import { SchoolFilters, TableFilters } from "src/models/book";
import FilterBySchoolDialog from "./filter-by-school-dialog.vue";

const { t } = useI18n();

const props = defineProps<{
  filterOptions: ReturnType<typeof useTranslatedFilters>["value"];
  modelValue: TableFilters;
}>();

const emit = defineEmits<{
  "update:modelValue": [newFilters: TableFilters];
}>();

const newFilters = ref(cloneDeep(props.modelValue));

const SCHOOL_FILTER_LABEL = t("book.filters.school");

// We can just check the selection of the school to state that that filter is selected since courses
// can be only selected after selecting at least a school
const isSchoolFilterSelected = computed(
  () =>
    newFilters.value.schoolFilters &&
    newFilters.value.schoolFilters.selectedSchoolCodes.length > 0,
);

// "selectedFiltersDisplay" is required because the filters are translated and if a user were to switch
// language they should update, so the key for each filter is an integer ID
// and the label is what's shown in the filter UI
const selectedFiltersDisplay = computed(() =>
  [
    ...props.modelValue.filters.map((filter) => props.filterOptions[filter]),
    ...(isSchoolFilterSelected.value ? [SCHOOL_FILTER_LABEL] : []),
  ].join(", "),
);

function updateSearch(newSearchQuery: string | null) {
  newFilters.value.searchQuery = newSearchQuery ?? "";
  emit("update:modelValue", newFilters.value as TableFilters);
}

function updateFilters(filters: TableFilters["filters"] | null) {
  newFilters.value.filters = filters ?? [];
  emit("update:modelValue", newFilters.value);
}

function clearSchoolFiltersFilters() {
  newFilters.value.schoolFilters = {
    selectedSchoolCodes: [],
    selectedSchoolCourseIds: [],
  };
  emit("update:modelValue", newFilters.value);
}

function openSchoolFilterDialog(selectedFilters: SchoolFilters) {
  Dialog.create({
    component: FilterBySchoolDialog,
    componentProps: {
      selectedFilters,
    },
  }).onOk((schoolFilters: SchoolFilters) => {
    newFilters.value.schoolFilters = schoolFilters;
    emit("update:modelValue", {
      ...newFilters.value,
      schoolFilters,
    });
  });
}
</script>
