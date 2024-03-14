<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="t('auth.editMyData')"
      :submit-label="t('common.save')"
      size="sm"
      @submit="onDialogOK(user)"
      @cancel="onDialogCancel()"
    >
      <q-card-section class="column gap-24 q-pa-lg">
        <q-input
          v-for="(field, key) in formData"
          :key="key"
          v-model="newUserData[key]"
          :label="field.label"
          :rules="field.rules"
          :type="field.type"
          lazy-rules
          outlined
        >
          <!-- TODO: add check for password field -->
          <template #append>
            <q-icon
              v-if="key === 'confirmPassword'"
              :name="hidePassword ? mdiEyeOff : mdiEye"
              class="cursor-pointer"
              @click="hidePassword = !hidePassword"
            />
            <!-- TODO: Update the v-else-if to check for the delegate info field -->
            <q-icon
              v-else-if="field.label === ''"
              :name="mdiInformationOutline"
              color="black-54"
            >
              <q-tooltip>
                {{ t("auth.delegateLabel") }}
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {
  mdiEye,
  mdiEyeOff,
  mdiInformationOutline,
} from "@quasar/extras/mdi-v7";
import { QInputProps, ValidationRule, useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { emailRule, makeValueMatchRule, requiredRule } from "src/helpers/rules";
import { UserInfo } from "src/models/auth";
import { useAuthService } from "src/services/auth";
import KDialogFormCard from "./k-dialog-form-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { t } = useI18n();

const { user } = useAuthService();

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
  useDialogPluginComponent<UserInfo>();

type UserData = UserInfo & {
  confirmEmail: string;
  confirmPassword: string;
};

const newUserData = ref<UserData>({
  email: user.value?.email ?? "",
  firstname: user.value?.firstname ?? "",
  lastname: user.value?.lastname ?? "",
  phoneNumber: user.value?.phoneNumber ?? "",
  confirmEmail: "",
  confirmPassword: "",
});

const hidePassword = ref(true);

const formData = computed<{
  [Key in keyof UserData]: {
    label: string;
    type?: QInputProps["type"];
    infoLabel?: string;
    rules?: ValidationRule[];
  };
}>(() => ({
  firstname: {
    label: t("auth.firstName"),
    rules: [requiredRule],
  },
  lastname: {
    label: t("auth.lastName"),
    rules: [requiredRule],
  },
  // TODO: add birth date
  // TODO: add delegate name
  phoneNumber: {
    label: t("auth.phoneNumber"),
  },
  email: {
    label: t("auth.emailAddress"),
    rules: newUserData.value.email.length > 0 ? [emailRule] : undefined,
  },
  confirmEmail: {
    label: t("auth.confirmEmail"),
    rules: [
      makeValueMatchRule(newUserData.value.email, t("auth.emailsDoNotMatch")),
    ],
  },
  // TODO: add password
  confirmPassword: {
    label: t("auth.confirmPassword"),
    type: hidePassword.value ? "password" : "text",
    // TODO: add makeValueMatchRule(password) rule
    rules: [requiredRule],
  },
}));
</script>
