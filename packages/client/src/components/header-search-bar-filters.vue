<template>
  <q-card-section class="full-width gap-16 items-center q-pa-md row">
    <q-input
      v-model="searchQuery"
      debounce="200"
      type="search"
      class="col max-width-600"
      outlined
      :placeholder="t('common.search')"
    >
      <template #append>
        <q-icon :name="mdiMagnify" />
      </template>
    </q-input>

    <q-select
      v-model="filters"
      :label="t('book.filter')"
      :options="filterOptions.map(({ key }) => key)"
      class="width-200"
      multiple
      outlined
    >
      <!--
        This is because the filters are translated and if a user were to switch
        language they should update, so the key for each filter is an integer ID
        and the label is what's shown in the filter UI
      -->
      <template v-if="filters.length > 0" #selected>
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
            <q-item-label> {{ filterOptions[opt]?.label }} </q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template v-if="schoolFilters" #after-options>
        <q-item clickable @click="openSchoolFilterDialog()">
          <q-item-section>
            {{ t("book.filters.school") }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <span class="col gap-16 items-center justify-end row">
      <slot name="side-actions" />
    </span>
  </q-card-section>
</template>

<script setup lang="ts">
import { mdiMagnify } from "@quasar/extras/mdi-v7";
import { Dialog } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTranslatedFilters } from "src/composables/use-filter-translations";
import { SchoolFilters } from "src/models/book";
import FilterBySchoolDialog from "./filter-by-school-dialog.vue";

const { t } = useI18n();

const searchQuery = defineModel<string>("searchQuery", { required: true });
const filters = defineModel<unknown[]>("filters", { required: true });
const schoolFilters = defineModel<SchoolFilters | undefined>("schoolFilters");

const props = defineProps<{
  filterOptions: ReturnType<typeof useTranslatedFilters>["value"];
}>();

const selectedFiltersDisplay = computed(() =>
  filters.value
    .map(
      (filter) => props.filterOptions.find(({ key }) => key === filter)?.label,
    )
    .join(", "),
);

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
      selectedFilters: schoolFilters.value,
    },
  }).onOk((payload: SchoolFilters) => {
    schoolFilters.value = payload;
  });
}
</script>
