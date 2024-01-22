<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('manageUsers.editUser.title')"
      :submit-label="$t('common.save')"
      size="sm"
      @submit="
        onDialogOK({
          user: newUserData.user,
          password: newUserData.newPassword,
        })
      "
      @cancel="onDialogCancel"
    >
      <q-card-section class="gap-16">
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
              :name="hidePassword ? 'mdi-eye-off' : 'mdi-eye'"
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
              :name="hideConfirm ? 'mdi-eye-off' : 'mdi-eye'"
              class="cursor-pointer"
              @click="hideConfirm = !hideConfirm"
            />
          </template>
        </q-input>
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash-es";
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import {
  emailRule,
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { UserFragment } from "src/services/user.graphql";
import KDialogFormCard from "../k-dialog-form-card.vue";

const props = defineProps<{
  userData: UserFragment;
}>();

const newUserData = ref({
  user: cloneDeep(props.userData),
  newPassword: "",
  confirmPassword: "",
});
const hidePassword = ref(true);
const hideConfirm = ref(true);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>

<style scoped lang="scss">
.form-card {
  width: 360px;
}
</style>
