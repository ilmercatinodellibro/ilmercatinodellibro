<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card :title="$t('book.retrieveBooksDialog.title')">
      <q-card-section>
        {{ $t("book.retrieveBooksDialog.message") }}
      </q-card-section>

      <template #card-actions>
        <q-btn
          outlined
          no-wrap
          :label="$t('book.retrieveBooksDialog.retrieveBooksBtn')"
          @click="onDialogOK(false)"
        />
        <q-space />
        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />
        <q-btn no-wrap color="accent" @click="onDialogOK(true)">
          <q-item-label>
            <q-icon name="mdi-information-outline" class="q-mr-sm" size="18px">
              <q-tooltip>
                {{ $t("book.retrieveBooksDialog.tooltip") }}
              </q-tooltip>
            </q-icon>
            {{ $t("book.retrieveBooksDialog.retrieveAndPrint") }}
          </q-item-label>
        </q-btn>
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import KDialogCard from "../k-dialog-card.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>
