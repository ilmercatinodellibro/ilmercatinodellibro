<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="dialog-wrapper">
      <q-card-section>
        <div class="text-h6">
          {{
            $t("manageUsers.bookedBooksDialog.title", [
              userData.firstname,
              userData.lastname,
            ])
          }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <dialog-table :columns="columns"
      /></q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="$t('common.close')" @click="onDialogOK(userData)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QDialog, useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { User } from "src/@generated/graphql";
import DialogTable from "./dialog-table.vue";

const { t } = useI18n();

const columns = computed(() => [
  {
    label: t(""),
    name: "",
    field: "",
  },
]);

defineProps<{
  userData: User;
}>();

const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>
