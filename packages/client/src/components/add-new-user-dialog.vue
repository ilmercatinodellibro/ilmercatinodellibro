<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="t('general.rolesAndPermissions.addNewOperator.title')"
      :submit-label="t('actions.sendInvitation')"
      size="sm"
      @cancel="onDialogCancel"
      @submit="onSubmit"
    >
      <q-card-section>
        <p>
          {{ t("general.rolesAndPermissions.addNewOperator.message") }}
        </p>
        <q-select
          v-model="email"
          :label="t('auth.emailAddress')"
          :options="emails"
          :rules="[requiredRule, emailRule]"
          data-cy="email-field"
          clearable
          hide-dropdown-icon
          lazy-rules
          new-value-mode="add-unique"
          outlined
          use-input
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { emailRule, requiredRule } from "src/helpers/rules";
import { useRetailLocationService } from "src/services/retail-location";
import { useGetAllCustomersQuery } from "src/services/user.graphql";
import KDialogFormCard from "./k-dialog-form-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

const { t } = useI18n();

const email = ref("");

const { selectedLocation } = useRetailLocationService();
const { allUsers: customers } = useGetAllCustomersQuery(() => ({
  retailLocationId: selectedLocation.value.id,
}));

const emails = computed(() => customers.value.map(({ email }) => email));

function onSubmit() {
  onDialogOK(email.value);
}
</script>
