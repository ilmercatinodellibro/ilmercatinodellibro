<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t(`manageUsers.editUser.${userData ? 'title' : 'createUser'}`)"
      size="sm"
      @submit="onDialogOK(newUserData)"
      @cancel="onDialogCancel"
    >
      <q-card-section class="column gap-4 no-wrap">
        <q-input
          v-model="newUserData.firstname"
          :label="$t('manageUsers.fields.firstName')"
          :rules="[requiredRule]"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.lastname"
          :label="$t('manageUsers.fields.lastName')"
          :rules="[requiredRule]"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.email"
          :label="$t('manageUsers.fields.email')"
          :rules="newUserData.email ? [emailRule] : undefined"
          autocomplete="off"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.phoneNumber"
          :label="$t('manageUsers.fields.phoneNumber')"
          bottom-slots
          clearable
          mask="phone"
          outlined
        />
        <q-item-section class="column gap-24 no-padding no-wrap">
          <q-input
            v-model="newUserData.password"
            :label="$t('auth.password')"
            :rules="newUserData.password ? [validatePasswordRule] : undefined"
            :type="hidePassword ? 'password' : 'text'"
            autocomplete="new-password"
            outlined
          >
            <template #append>
              <q-icon
                :name="hidePassword ? mdiEyeOff : mdiEye"
                class="cursor-pointer"
                @click="hidePassword = !hidePassword"
              />
            </template>
          </q-input>
          <q-input
            v-model="newUserData.passwordConfirmation"
            :label="$t('auth.confirmPassword')"
            :rules="
              newUserData.password
                ? [
                    makeValueMatchRule(
                      newUserData.password,
                      $t('auth.passwordDoNotMatch'),
                    ),
                  ]
                : undefined
            "
            :type="hideConfirm ? 'password' : 'text'"
            autocomplete="new-password"
            outlined
          >
            <template #append>
              <q-icon
                :name="hideConfirm ? mdiEyeOff : mdiEye"
                class="cursor-pointer"
                @click="hideConfirm = !hideConfirm"
              />
            </template>
          </q-input>
          <q-input
            v-model="newUserData.notes"
            :label="$t('manageUsers.editUser.notes')"
            clearable
            outlined
          />
          <q-checkbox
            v-model="newUserData.discount"
            :disable="!hasAdminRole"
            :label="$t('manageUsers.editUser.discount')"
          />
        </q-item-section>
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiEye, mdiEyeOff } from "@quasar/extras/mdi-v7";
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { RegisterUserPayload, UpdateUserPayload } from "src/@generated/graphql";
import {
  emailRule,
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";
import KDialogFormCard from "../k-dialog-form-card.vue";

const { userData } = defineProps<{
  userData?: UpdateUserPayload;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent<DataType<typeof userData>>();

const { hasAdminRole } = useAuthService();

const { selectedLocation } = useRetailLocationService();

type DataType<T> = T extends undefined
  ? RegisterUserPayload
  : UpdateUserPayload;

const newUserData = ref<DataType<typeof userData>>(
  userData
    ? { ...userData }
    : {
        retailLocationId: selectedLocation.value.id,
        email: "",
        firstname: "",
        lastname: "",
        discount: false,
        notes: "",
        password: "",
        passwordConfirmation: "",
        phoneNumber: "",
      },
);
const hidePassword = ref(true);
const hideConfirm = ref(true);
</script>
