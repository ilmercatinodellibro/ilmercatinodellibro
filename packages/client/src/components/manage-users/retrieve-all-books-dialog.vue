<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="col-auto">
      <q-card-section class="text-h6 text-primary">
        {{ $t("book.retrieveBooksDialog.title") }}
      </q-card-section>

      <q-card-section>
        {{ $t("book.retrieveBooksDialog.message") }}
      </q-card-section>

      <q-card-actions class="no-wrap">
        <q-btn
          outlined
          no-wrap
          :label="$t('book.retrieveBooksDialog.retrieveBooksBtn')"
          @click="onDialogOK(false)"
        />
        <q-space />
        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />
        <q-btn no-wrap color="accent" @click="onDialogOK(true)">
          <q-icon name="mdi-information-outline" class="q-mr-sm">
            <q-tooltip>
              {{ $t("book.retrieveBooksDialog.tooltip") }}
            </q-tooltip>
          </q-icon>
          <q-item-label>
            {{ $t("book.retrieveBooksDialog.retrieveAndPrint") }}
          </q-item-label>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>
