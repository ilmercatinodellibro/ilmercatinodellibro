<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('book.filters.school')"
      :save-label="$t('book.filter')"
      size="sm"
      @save="onDialogOK(newFilters)"
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
import { ref } from "vue";
import KDialogFormCard from "./k-dialog-form-card.vue";

const props = defineProps<{
  filters: { schoolCodes: string[]; addresses: string[] };
  selectedFilters?: { schoolCodes: string[]; addresses: string[] };
}>();

const newFilters = ref(props.selectedFilters ?? ({} as typeof props.filters));

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>

<style scoped lang="scss">
.dialog-card {
  width: 360px;
}
</style>
