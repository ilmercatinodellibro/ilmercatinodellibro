<!-- FIXME: add complete structure once the new mockup has been approved -->
<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      size="lg"
      :cancel-label="$t('common.close')"
      :title="
        $t('manageUsers.requestedBooksDialog.title', [
          userData.firstname,
          userData.lastname,
        ])
      "
      @cancel="onDialogCancel"
    >
      <q-card-section class="q-pa-none">
        <dialog-table :columns="columns" />
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QDialog, useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { User } from "src/@generated/graphql";
import KDialogCard from "../k-dialog-card.vue";
import DialogTable from "./dialog-table.vue";

const { t } = useI18n();

// FIXME: add columns, rows and rest of the logic
//  once the new mockup has been approved
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

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>
