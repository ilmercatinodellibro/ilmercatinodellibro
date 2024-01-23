<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('book.filters.school')"
      :submit-label="$t('book.filter')"
      size="sm"
      @submit="onDialogOK(newFilters)"
      @cancel="onDialogCancel"
    >
      <q-card-section class="q-gutter-md">
        <q-select
          v-model="newFilters.addresses"
          :label="$t('book.filters.schoolFilter.fields.address')"
          :options="filters.addresses"
          fill-input
          multiple
          outlined
        />

        <q-select
          v-model="newFilters.schoolCodes"
          :label="$t('book.filters.schoolFilter.fields.school')"
          :options="filters.schoolCodes"
          fill-input
          multiple
          outlined
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { reactive } from "vue";
import { SchoolFilters } from "src/models/book";
import KDialogFormCard from "./k-dialog-form-card.vue";

const props = defineProps<{
  filters: SchoolFilters;
  selectedFilters?: SchoolFilters;
}>();

const newFilters = reactive<SchoolFilters>(
  props.selectedFilters ??
    ({
      schoolCodes: [],
      addresses: [],
    } satisfies SchoolFilters),
);

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent<SchoolFilters>();

defineEmits(useDialogPluginComponent.emitsObject);
</script>

<style scoped lang="scss">
.dialog-card {
  width: 360px;
}
</style>