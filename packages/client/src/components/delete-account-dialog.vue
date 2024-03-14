<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide()">
    <k-dialog-card
      :title="t('auth.deleteAccount')"
      :save-label="t('auth.deleteAccountDialog.deleteAccount')"
      size="sm"
      show-save-button
      @cancel="onDialogCancel()"
      @save="onDialogOK()"
    >
      <q-card-section class="column gap-24 q-pa-md">
        <span class="text-h6 text-primary">
          {{ t("auth.deleteAccountDialog.disclaimer") }}
        </span>
        <span>
          {{ t("auth.deleteAccountDialog.message") }}
        </span>
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { useI18n } from "vue-i18n";
import kDialogCard from "./k-dialog-card.vue";

const { t } = useI18n();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>
