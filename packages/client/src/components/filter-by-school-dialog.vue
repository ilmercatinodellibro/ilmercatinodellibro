<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="dialog-card">
      <q-card-section class="q-px-lg q-py-md">
        <div class="tex-primary text-h6">
          {{ $t("book.filters.school") }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-col-gutter-lg q-pa-lg">
        <q-select
          v-for="(filter, index) in filters"
          :key="index"
          v-model="newFilters[index]"
          :label="
            $t(
              `book.filters.schoolFilter.fields.${
                index === 0 ? 'address' : 'school'
              }`,
            )
          "
          :options="filter"
          fill-input
          multiple
          outlined
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn :label="$t('common.cancel')" flat @click="onDialogCancel()" />
        <q-btn
          :label="$t('book.filter')"
          flat
          @click="onDialogOK(newFilters)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash-es";
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";

const props = defineProps<{
  filters: string[][];
  selectedFilters: string[][] | undefined;
}>();

const newFilters = ref(cloneDeep(props.selectedFilters) ?? ([] as string[][]));

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>

<style scoped lang="scss">
.dialog-card {
  width: 360px;
}
</style>
