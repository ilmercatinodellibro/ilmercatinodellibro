<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-form-card
      :title="t('auth.editMyData')"
      :submit-label="t('common.save')"
      size="sm"
      @cancel="onDialogCancel()"
      @submit="
        onDialogOK({
          email: newUserData.email,
          firstname: newUserData.firstname,
          lastname: newUserData.lastname,
          dateOfBirth: Date.parse(newUserData.dateOfBirth),
          delegate: newUserData.delegate,
          password: newUserData.password,
          passwordConfirmation: newUserData.passwordConfirmation,
          phoneNumber: newUserData.phoneNumber,
        })
      "
    >
      <q-card-section class="column gap-4 q-pb-xs q-pt-lg q-px-lg">
        <q-input
          v-for="(field, key) in formData"
          :key="key"
          v-model="newUserData[key]"
          v-bind="field"
          :autocomplete="
            [
              'password',
              'passwordConfirmation',
              'email',
              'confirmEmail',
            ].includes(key)
              ? 'new-password'
              : 'off'
          "
          bottom-slots
          lazy-rules
          outlined
        >
          <template #append>
            <q-icon
              v-if="key === 'password' || key === 'passwordConfirmation'"
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
import { QInputProps, date, useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { UpdateUserPayload } from "src/@generated/graphql";
import {
  emailRule,
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { UserData } from "src/models/user";
import { useAuthService } from "src/services/auth";
import KDialogFormCard from "./k-dialog-form-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { t } = useI18n();

const { user } = useAuthService();

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
  useDialogPluginComponent<
    Omit<UpdateUserPayload, "id" | "retailLocationId">
  >();

const newUserData = ref<
  Omit<UserData, "dateOfBirth"> & { dateOfBirth: string }
>({
  email: user.value?.email ?? "",
  firstname: user.value?.firstname ?? "",
  lastname: user.value?.lastname ?? "",
  phoneNumber: user.value?.phoneNumber ?? "",
  password: "",
  dateOfBirth: user.value?.dateOfBirth
    ? date.formatDate(new Date(user.value.dateOfBirth), "YYYY-MM-DD")
    : "",
  delegate: user.value?.delegate ?? "",
  confirmEmail: "",
  passwordConfirmation: "",
});

const hidePassword = ref(true);

const formData = computed<
  Record<
    keyof UserData,
    Omit<QInputProps, "modelValue"> & {
      infoLabel?: string;
    }
  >
>(() => {
  // eslint-disable-next-line no-console
  console.log(user.value?.dateOfBirth);
  return {
    firstname: {
      label: t("auth.firstName"),
      rules: [requiredRule],
    },
    lastname: {
      label: t("auth.lastName"),
      rules: [requiredRule],
    },
    dateOfBirth: {
      label: t("auth.birthDate"),
      type: "date",
    },
    delegate: {
      label: t("auth.nameOfDelegate"),
      infoLabel: t("auth.delegateLabel"),
      rules:
        newUserData.value.dateOfBirth &&
        new Date().getUTCFullYear() -
          new Date(newUserData.value.dateOfBirth).getUTCFullYear() <
          18
          ? [requiredRule]
          : undefined,
    },
    phoneNumber: {
      label: t("auth.phoneNumber"),
    },
    email: {
      label: t("auth.emailAddress"),
      rules: newUserData.value.email ? [emailRule] : undefined,
    },
    confirmEmail: {
      label: t("auth.confirmEmail"),
      rules:
        newUserData.value.email && newUserData.value.email !== user.value?.email
          ? [
              makeValueMatchRule(
                newUserData.value.email,
                t("auth.emailsDoNotMatch"),
              ),
            ]
          : undefined,
    },
    password: {
      label: t("auth.password"),
      type: hidePassword.value ? "password" : "text",
      rules: newUserData.value.password
        ? [requiredRule, validatePasswordRule]
        : undefined,
    },
    passwordConfirmation: {
      label: t("auth.confirmPassword"),
      type: hidePassword.value ? "password" : "text",
      rules: newUserData.value.password
        ? [
            requiredRule,
            makeValueMatchRule(
              newUserData.value.password,
              t("auth.passwordDoNotMatch"),
            ),
          ]
        : undefined,
    },
  };
});
</script>
