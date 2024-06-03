<!-- TODO: add the logic to manage label printing and update to match the mock-ups -->
<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card :title="$t('book.retrieveBooksDialog.title')">
      <q-card-section>
        {{ $t("book.retrieveBooksDialog.message") }}
      </q-card-section>

      <template #card-actions>
        <q-space />

        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />

        <q-btn
          :label="$t('book.retrieveBooksDialog.retrieveBooksBtn')"
          color="primary"
          no-wrap
          @click="onDialogOK(false)"
        />
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import KDialogCard from "../k-dialog-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>
