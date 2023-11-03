<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      size="sm"
      :title="t(`actions.addNewUser`)"
      :submit-label="t(`actions.sendInvitation`)"
      :cancel-label="t('common.cancel')"
      @cancel="onDialogCancel"
      @submit="onSubmit"
    >
      <q-card-section>
        <q-input
          v-model="email"
          :rules="[requiredRule, emailRule]"
          lazy-rules
          :label="t(`auth.email`)"
          outlined
          type="email"
          data-cy="email-field"
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { emailRule, requiredRule } from "src/helpers/rules";
import KDialogFormCard from "./k-dialog-form-card.vue";

const email = ref<string>("");

const { t } = useI18n();

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

function onSubmit() {
  onDialogOK(email.value);
}
</script>
