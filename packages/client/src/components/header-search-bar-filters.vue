<template>
  <q-card-section class="full-width gap-16 items-center q-pa-md row">
    <q-input
      :model-value="newFilters.searchQuery"
      debounce="400"
      type="search"
      class="col max-width-600"
      outlined
      :placeholder="t('common.search')"
      @update:model-value="(query) => updateSearch(query as string)"
    >
      <template #append>
        <q-icon :name="mdiMagnify" />
      </template>
    </q-input>

    <q-select
      :label="t('book.filter')"
      :model-value="newFilters.filters"
      :options="Object.keys(filterOptions)"
      class="width-200"
      multiple
      outlined
      @update:model-value="updateFilters"
    >
      <!--
        This is because the filters are translated and if a user were to switch
        language they should update, so the key for each filter is an integer ID
        and the label is what's shown in the filter UI
      -->
      <template v-if="Object.entries(newFilters.filters).length > 0" #selected>
        {{ selectedFiltersDisplay }}
      </template>

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
        <q-item clickable @click="openSchoolFilterDialog()">
          <q-item-section>
            {{ t("book.filters.school") }}
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
import { mdiMagnify } from "@quasar/extras/mdi-v7";
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

const selectedFiltersDisplay = computed(() =>
  props.modelValue.filters
    .map((filter) => props.filterOptions[filter])
    .join(", "),
);

function updateSearch(newSearchQuery: string) {
  newFilters.value.searchQuery = newSearchQuery;
  emit("update:modelValue", newFilters.value as TableFilters);
}

function updateFilters(filters: TableFilters["filters"]) {
  newFilters.value.filters = filters;
  emit("update:modelValue", newFilters.value);
}

// FIXME: Add actual logic with server fetch
const schoolFilterOptions: SchoolFilters = {
  schoolCodes: ["SchoolCode0", "SchoolCode1", "SchoolCode2", "SchoolCode3"],
  courses: ["Address0", "Address1", "Address2", "Address3", "Address4"],
};

function openSchoolFilterDialog() {
  Dialog.create({
    component: FilterBySchoolDialog,
    componentProps: {
      filters: schoolFilterOptions,
      selectedFilters: props.modelValue.schoolFilters,
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
