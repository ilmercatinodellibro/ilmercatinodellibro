<!-- TODO: refactor once server side is implemented -->
<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('reserveBooks.findBooksDialog.title')"
      size="sm"
      @cancel="onDialogCancel"
      @submit="onDialogOK({ school, course, year })"
    >
      <q-card-section class="column gap-24 q-pa-lg">
        <q-select
          v-model="school"
          :label="$t('book.filters.schoolFilter.fields.school')"
          outlined
        />
        <q-select
          v-model="course"
          :label="$t('book.filters.schoolFilter.fields.course')"
          outlined
        />
        <q-select
          v-model="year"
          :label="$t('book.filters.schoolFilter.fields.year')"
          :options="COURSE_YEARS"
          outlined
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { COURSE_YEARS, CourseDetails } from "src/models/book";
import KDialogFormCard from "./k-dialog-form-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent<CourseDetails>();

// TODO: add logic once the server side is implemented
const school = ref<CourseDetails["school"]>("");
const course = ref<CourseDetails["course"]>("");
const year = ref<CourseDetails["year"]>(1);
</script>
