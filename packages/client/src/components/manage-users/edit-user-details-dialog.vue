<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t(`manageUsers.editUser.${userData ? 'title' : 'createUser'}`)"
      size="sm"
      @submit="
        onDialogOK({
          type: 'id' in newUserData ? 'update' : 'create',
          data: {
            ...newUserData,
            dateOfBirth: Date.parse(birthDate),
          } as RegisterUserPayload & UpdateUserPayload, // Otherwise TypesScript cannot properly narrow down the object's type
        })
      "
      @cancel="onDialogCancel"
    >
      <!-- bottom-slots prop is used when there are no rules/hint/etc. to unify bottom padding with the ones that do have -->
      <!-- The listeners on @clear are to make the model an empty string instead of null when cleared -->
      <q-card-section class="column gap-16 no-wrap q-pb-xs q-pt-lg q-px-lg">
        <q-input
          v-model="newUserData.firstname"
          :label="$t('manageUsers.fields.firstName')"
          :disable="scheduledForDeletion"
          :rules="[requiredRule]"
          autocomplete="off"
          bottom-slots
          clearable
          outlined
          @clear="newUserData.firstname = ''"
        />
        <q-input
          v-model="newUserData.lastname"
          :label="$t('manageUsers.fields.lastName')"
          :disable="scheduledForDeletion"
          :rules="[requiredRule]"
          autocomplete="off"
          bottom-slots
          clearable
          outlined
          @clear="newUserData.lastname = ''"
        />
        <q-input
          v-model="birthDate"
          :label="t('auth.birthDate')"
          :disable="scheduledForDeletion"
          autocomplete="off"
          bottom-slots
          clearable
          outlined
          type="date"
          @clear="birthDate = ''"
        />
        <q-input
          v-model="newUserData.delegate"
          :label="t('auth.nameOfDelegate')"
          :disable="scheduledForDeletion"
          :rules="[requireIfUnderage(birthDate)]"
          autocomplete="off"
          bottom-slots
          clearable
          outlined
          @clear="newUserData.delegate = ''"
        >
          <template #append>
            <q-icon :name="mdiInformationOutline">
              <q-tooltip>
                {{ t("auth.delegateLabel") }}
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
        <q-input
          v-model="newUserData.email"
          :label="$t('manageUsers.fields.email')"
          :disable="scheduledForDeletion"
          :rules="newUserData.email ? [emailRule] : undefined"
          autocomplete="off"
          bottom-slots
          clearable
          outlined
          @clear="newUserData.email = ''"
        />
        <q-input
          v-model="newUserData.phoneNumber"
          :disable="scheduledForDeletion"
          :label="$t('manageUsers.fields.phoneNumber')"
          autocomplete="new-password"
          bottom-slots
          clearable
          mask="phone"
          outlined
          @clear="newUserData.phoneNumber = ''"
        />
        <q-input
          v-model="newUserData.password"
          :disable="scheduledForDeletion"
          :label="$t('auth.password')"
          :rules="newUserData.password ? [validatePasswordRule] : [() => true]"
          :type="hidePassword ? 'password' : 'text'"
          autocomplete="new-password"
          bottom-slots
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
              : [() => true]
          "
          :type="hideConfirm ? 'password' : 'text'"
          autocomplete="new-password"
          bottom-slots
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
          v-model.string="newUserData.notes"
          :disable="scheduledForDeletion"
          :label="$t('manageUsers.editUser.notes')"
          autocomplete="off"
          bottom-slots
          input-class="max-height-130"
          clearable
          outlined
          type="textarea"
          @clear="newUserData.notes = ''"
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

        <q-card-section class="column gap-24 no-wrap q-pb-lg q-px-lg">
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
  mdiInformationOutline,
} from "@quasar/extras/mdi-v7";
import { formatDate } from "@vueuse/core";
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { RegisterUserPayload, UpdateUserPayload } from "src/@generated/graphql";
import {
  emailRule,
  makeValueMatchRule,
  requireIfUnderage,
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

const { t } = useI18n();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent<UserDialogPayload>();

const { hasAdminRole } = useAuthService();

const { selectedLocation } = useRetailLocationService();

const birthDate = ref(
  userData?.dateOfBirth
    ? formatDate(new Date(userData.dateOfBirth), "YYYY-MM-DD")
    : "",
);
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
        dateOfBirth: Date.parse(birthDate.value),
        delegate: "",
      } satisfies RegisterUserPayload),
);
const hidePassword = ref(true);
const hideConfirm = ref(true);
</script>
