<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t(`manageUsers.editUser.${userData ? 'title' : 'createUser'}`)"
      size="sm"
      @submit="
        onDialogOK(
          'id' in newUserData
            ? { type: 'update', data: newUserData }
            : { type: 'create', data: newUserData },
        )
      "
      @cancel="onDialogCancel"
    >
      <!-- bottom-slots prop is used when there are no rules/hint/etc. to unify bottom padding with the ones that do have -->
      <q-card-section class="column gap-4 no-wrap">
        <q-input
          v-model="newUserData.firstname"
          :label="$t('manageUsers.fields.firstName')"
          :disable="scheduledForDeletion"
          :rules="[requiredRule]"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.lastname"
          :label="$t('manageUsers.fields.lastName')"
          :disable="scheduledForDeletion"
          :rules="[requiredRule]"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.email"
          :label="$t('manageUsers.fields.email')"
          :disable="scheduledForDeletion"
          :rules="newUserData.email ? [emailRule] : undefined"
          autocomplete="off"
          clearable
          outlined
        />
        <q-input
          v-model="newUserData.phoneNumber"
          :disable="scheduledForDeletion"
          :label="$t('manageUsers.fields.phoneNumber')"
          bottom-slots
          clearable
          mask="phone"
          outlined
        />
        <q-input
          v-model="newUserData.password"
          :disable="scheduledForDeletion"
          :label="$t('auth.password')"
          :rules="newUserData.password ? [validatePasswordRule] : undefined"
          :type="hidePassword ? 'password' : 'text'"
          autocomplete="new-password"
          outlined
          bottom-slots
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
          :disable="scheduledForDeletion"
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
          bottom-slots
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
          :disable="scheduledForDeletion"
          :label="$t('manageUsers.editUser.notes')"
          clearable
          outlined
          bottom-slots
        />
        <q-checkbox
          v-model="newUserData.discount"
          :disable="scheduledForDeletion || !hasAdminRole"
          :label="$t('manageUsers.editUser.discount')"
          bottom-slots
        />
      </q-card-section>

      <template v-if="'id' in newUserData">
        <q-separator inset spaced />

        <q-card-section class="column gap-8 no-wrap">
          <q-btn
            outline
            :icon="mdiDownload"
            :label="$t('manageUsers.editUser.downloadData')"
            @click="
              onDialogOK({
                type: 'downloadData',
                data: { id: newUserData.id },
              })
            "
          />

          <q-btn
            v-if="!scheduledForDeletion"
            outline
            :icon="mdiAccountRemove"
            color="negative"
            :label="$t('manageUsers.editUser.deleteUser')"
            @click="
              onDialogOK({
                type: 'toggleDeletion',
                data: { id: newUserData.id },
              })
            "
          />
          <q-btn
            v-else
            outline
            :icon="mdiAccountReactivate"
            :label="$t('manageUsers.editUser.cancelUserDeletion')"
            @click="
              onDialogOK({
                type: 'toggleDeletion',
                data: { id: newUserData.id },
              })
            "
          />
        </q-card-section>
      </template>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {
  mdiAccountReactivate,
  mdiAccountRemove,
  mdiDownload,
  mdiEye,
  mdiEyeOff,
} from "@quasar/extras/mdi-v7";
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { RegisterUserPayload, UpdateUserPayload } from "src/@generated/graphql";
import {
  emailRule,
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { UserDialogPayload } from "src/models/user";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";
import KDialogFormCard from "../k-dialog-form-card.vue";

// We don't need reactivity on the props as this is used through the Dialog plugin
const { userData, scheduledForDeletion } = defineProps<{
  userData?: UpdateUserPayload;
  scheduledForDeletion?: boolean;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent<UserDialogPayload>();

const { hasAdminRole } = useAuthService();

const { selectedLocation } = useRetailLocationService();

const newUserData = ref(
  userData
    ? ({ ...userData } satisfies UpdateUserPayload)
    : ({
        retailLocationId: selectedLocation.value.id,
        email: "",
        firstname: "",
        lastname: "",
        discount: false,
        notes: "",
        password: "",
        passwordConfirmation: "",
        phoneNumber: "",
      } satisfies RegisterUserPayload),
);
const hidePassword = ref(true);
const hideConfirm = ref(true);
</script>
