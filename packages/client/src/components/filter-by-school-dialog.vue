<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="title"
      :submit-label="submitLabel"
      size="sm"
      @submit="
        onDialogOK({
          selectedSchoolCodes,
          selectedSchoolCourseIds,
        })
      "
      @cancel="onDialogCancel()"
    >
      <q-card-section class="column gap-16">
        <q-select
          :model-value="selectedSchoolCodes"
          :display-value="
            selectedSchoolCodes.length === 0
              ? requireCourse
                ? t('actions.selectAtLeastOneOption')
                : t('general.all')
              : undefined
          "
          :disable="isSchoolsLoading"
          :label="t('book.filters.schoolFilter.fields.school')"
          :multiple="!requireCourse"
          :options="schools"
          :rules="requireCourse ? [requiredRule] : undefined"
          bottom-slots
          clearable
          emit-value
          fill-input
          map-options
          option-label="name"
          option-value="code"
          outlined
          @update:model-value="
            (newModel) => (selectedSchoolCodes = newModel ?? [])
          "
        />

        <q-select
          :model-value="selectedSchoolCourseIds"
          :disable="
            isSchoolsLoading ||
            selectedSchoolCodes.length === 0 ||
            isSchoolCoursesLoading
          "
          :display-value="
            selectedSchoolCourseIds.length === 0
              ? requireCourse
                ? t('actions.selectAtLeastOneOption')
                : t('general.all')
              : undefined
          "
          :label="t('book.filters.schoolFilter.fields.course')"
          :option-label="
            ({ grade, section, school }: SchoolCourseFragment) =>
              `${grade}-${section} - ${school.name}`
          "
          :multiple="!requireCourse"
          :options="schoolCourses"
          :rules="requireCourse ? [requiredRule] : undefined"
          bottom-slots
          clearable
          emit-value
          fill-input
          map-options
          option-value="id"
          outlined
          @update:model-value="
            (newModel) => (selectedSchoolCourseIds = newModel ?? [])
          "
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { requiredRule } from "src/helpers/rules";
import { SchoolFilters } from "src/models/book";
import { useRetailLocationService } from "src/services/retail-location";
import {
  SchoolCourseFragment,
  useGetSchoolCoursesQuery,
  useGetSchoolsQuery,
} from "src/services/school.graphql";
import KDialogFormCard from "./k-dialog-form-card.vue";

const { t } = useI18n();

const props = defineProps<{
  title: string;
  submitLabel: string;
  selectedFilters?: SchoolFilters;
  requireCourse?: boolean;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { selectedLocation } = useRetailLocationService();
const { schools, loading: isSchoolsLoading } = useGetSchoolsQuery(() => ({
  retailLocationId: selectedLocation.value.id,
}));

const selectedSchoolCodes = ref(
  props.selectedFilters?.selectedSchoolCodes ?? [],
);

const { schoolCourses, loading: isSchoolCoursesLoading } =
  useGetSchoolCoursesQuery(
    () => ({ schoolCodes: selectedSchoolCodes.value }),
    () => ({ enabled: selectedSchoolCodes.value.length > 0 }),
  );

const selectedSchoolCourseIds = ref(
  props.selectedFilters?.selectedSchoolCourseIds ?? [],
);

watch(selectedSchoolCodes, () => {
  selectedSchoolCourseIds.value = [];
});

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent<SchoolFilters>();
</script>

<style scoped lang="scss">
.dialog-card {
  width: 360px;
}
</style>
