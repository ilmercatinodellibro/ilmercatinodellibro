<template>
  <q-dialog ref="dialogRef" full-height persistent @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('manageUsers.editUser.title')"
      size="sm"
      @submit="
        onDialogOK({
          user: newUserData.user,
          password: newUserData.newPassword,
        })
      "
      @cancel="onDialogCancel"
    >
      <q-card-section class="col-grow column gap-16 height-0 no-wrap">
        <q-input
          v-model="newUserData.user.firstname"
          :label="$t('manageUsers.fields.firstName')"
          :rules="[requiredRule]"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.user.lastname"
          :label="$t('manageUsers.fields.lastName')"
          :rules="[requiredRule]"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.user.email"
          :label="$t('manageUsers.fields.email')"
          :rules="[requiredRule, emailRule]"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.user.phoneNumber"
          :label="$t('manageUsers.fields.phoneNumber')"
          bottom-slots
          clearable
          mask="phone"
          outlined
        />
        <q-input
          v-model="newUserData.newPassword"
          :label="$t('auth.password')"
          :rules="[newUserData.newPassword ? validatePasswordRule : () => true]"
          :type="hidePassword ? 'password' : 'text'"
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
          v-model="newUserData.confirmPassword"
          :label="$t('auth.confirmPassword')"
          :rules="[
            makeValueMatchRule(
              newUserData.newPassword,
              $t('auth.passwordDoNotMatch'),
            ),
          ]"
          :type="hideConfirm ? 'password' : 'text'"
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
          v-model="newUserData.user.notes"
          :label="$t('manageUsers.editUser.notes')"
          clearable
          outlined
        />
        <q-checkbox
          v-model="newUserData.user.discount"
          :disable="!hasAdminRole"
          :label="$t('manageUsers.editUser.discount')"
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiEye, mdiEyeOff } from "@quasar/extras/mdi-v7";
import { cloneDeep } from "lodash-es";
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import {
  emailRule,
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { useAuthService } from "src/services/auth";
import { UserFragment } from "src/services/user.graphql";
import KDialogFormCard from "../k-dialog-form-card.vue";

const props = defineProps<{
  userData: UserFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

const { hasAdminRole } = useAuthService();

const newUserData = ref({
  user: cloneDeep(props.userData),
  newPassword: "",
  confirmPassword: "",
});
const hidePassword = ref(true);
const hideConfirm = ref(true);
</script>
