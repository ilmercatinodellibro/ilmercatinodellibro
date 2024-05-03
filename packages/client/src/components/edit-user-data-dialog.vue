<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="t('auth.editMyData')"
      :submit-label="t('common.save')"
      size="sm"
      @cancel="onDialogCancel()"
      @submit="onDialogOK(user)"
    >
      <q-card-section class="column gap-4 q-pb-xs q-pt-lg q-px-lg">
        <q-input
          v-for="(field, key) in formData"
          :key="key"
          v-model="newUserData[key]"
          :label="field.label"
          :rules="field.rules"
          :type="field.type"
          bottom-slots
          lazy-rules
          outlined
        >
          <template #append>
            <q-icon
              v-if="key === 'password' || key === 'confirmPassword'"
              :name="hidePassword ? mdiEyeOff : mdiEye"
              class="cursor-pointer"
              @click="hidePassword = !hidePassword"
            />
            <q-icon
              v-else-if="field.infoLabel"
              :name="mdiInformationOutline"
              color="black-54"
            >
              <q-tooltip>
                {{ field.infoLabel }}
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
import {
  emailRule,
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { useAuthService } from "src/services/auth";
import { UserInfoFragment } from "src/services/user.graphql";
import KDialogFormCard from "./k-dialog-form-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { t } = useI18n();

const { user } = useAuthService();

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
  useDialogPluginComponent<UserInfoFragment>();

type UserData = UserInfoFragment & {
  // TODO: remove stubbed fields
  password: string;
  date: number;
  delegate: string;
  confirmEmail: string;
  confirmPassword: string;
};

const newUserData = ref<UserData>({
  email: user.value?.email ?? "",
  firstname: user.value?.firstname ?? "",
  lastname: user.value?.lastname ?? "",
  phoneNumber: user.value?.phoneNumber ?? "",
  password: "",
  date: Date.now(),
  delegate: "",
  confirmEmail: "",
  confirmPassword: "",
});

const hidePassword = ref(true);

const formData = computed<
  Record<
    keyof Omit<UserData, "__typename">,
    {
      label: string;
      type?: QInputProps["type"];
      infoLabel?: string;
      rules?: ValidationRule[];
    }
  >
>(() => ({
  firstname: {
    label: t("auth.firstName"),
    rules: [requiredRule],
  },
  lastname: {
    label: t("auth.lastName"),
    rules: [requiredRule],
  },
  date: {
    label: t("auth.birthDate"),
    type: "date",
  },
  delegate: {
    label: t("auth.nameOfDelegate"),
    infoLabel: t("auth.delegateLabel"),
  },
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
  password: {
    label: t("auth.password"),
    type: hidePassword.value ? "password" : "text",
    rules: [requiredRule, validatePasswordRule],
  },
  confirmPassword: {
    label: t("auth.confirmPassword"),
    type: hidePassword.value ? "password" : "text",
    rules: [
      requiredRule,
      makeValueMatchRule(
        newUserData.value.password,
        t("auth.passwordDoNotMatch"),
      ),
    ],
  },
}));
</script>
