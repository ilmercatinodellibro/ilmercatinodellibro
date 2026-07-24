<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card :title="t('manageUsers.returnBookSuccessTitle')" size="sm">
      <q-card-section class="column items-center q-gutter-sm text-center">
        <span>{{
          t("manageUsers.newBookCodeLabel", { book: bookTitle })
        }}</span>
        <span class="text-h5 text-primary text-weight-bold">
          {{ newCode }}
        </span>
      </q-card-section>

      <template #card-actions>
        <q-btn
          :label="t('common.confirm')"
          color="primary"
          `
          @click="onDialogOK"
        />
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { useI18n } from "vue-i18n";
import KDialogCard from "../k-dialog-card.vue";

defineProps<{
  bookTitle: string;
  newCode: string;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const { t } = useI18n();
</script>
