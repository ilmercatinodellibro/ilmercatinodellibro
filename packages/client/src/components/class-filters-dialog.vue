<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('reserveBooks.findBooksDialog.title')"
      size="sm"
      @cancel="onDialogCancel"
      @submit="onDialogOK()"
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
          outlined
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import KDialogFormCard from "./k-dialog-form-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const school: string[] = [];
const course: string[] = [];
const year: string[] = [];
</script>
