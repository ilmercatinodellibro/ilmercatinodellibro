<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card :title="$t('book.retrieveBooksDialog.title')">
      <q-card-section>
        {{ $t("book.retrieveBooksDialog.message") }}
      </q-card-section>

      <template #card-actions>
        <q-btn
          outline
          no-wrap
          :label="$t('book.retrieveBooksDialog.retrieveBooksBtn')"
          @click="onDialogOK(false)"
        />

        <q-space />

        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />
        <q-btn no-wrap color="primary" @click="onDialogOK(true)">
          <q-icon :name="mdiInformationOutline" class="q-mr-sm" size="18px">
            <q-tooltip>
              {{ $t("book.retrieveBooksDialog.tooltip") }}
            </q-tooltip>
          </q-icon>

          {{ $t("book.retrieveBooksDialog.retrieveAndPrint") }}
        </q-btn>
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiInformationOutline } from "@quasar/extras/mdi-v7";
import { useDialogPluginComponent } from "quasar";
import KDialogCard from "../k-dialog-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>
