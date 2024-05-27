<template>
  <q-page class="justify-center registration-page row">
    <q-card class="column form-card gap-24 items-stretch no-wrap q-pa-lg">
      <q-card-section class="column gap-24 no-padding no-wrap">
        <q-img :src="theme.logo" fit="contain" height="60px" />

        <q-form
          class="column gap-16 items-stretch justify-center no-padding"
          greedy
          @submit="onSubmit"
        >
          <template v-for="fieldData in formData" :key="fieldData.field">
            <q-input
              v-model="user[fieldData.field]"
              v-bind="fieldData.inputData"
              :autocomplete="
                [
                  'password',
                  'passwordConfirmation',
                  'email',
                  'confirmEmail',
                ].includes(fieldData.field)
                  ? 'new-password'
                  : 'off'
              "
              bottom-slots
              class="col"
              outlined
              reactive-rules
            >
              <template
                v-if="
                  ['password', 'passwordConfirmation', 'delegate'].includes(
                    fieldData.field,
                  )
                "
                #append
              >
                <q-icon
                  v-if="
                    fieldData.field === 'password' ||
                    fieldData.field === 'passwordConfirmation'
                  "
                  :name="showPassword ? mdiEyeOff : mdiEye"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />

                <q-icon v-if="fieldData.tooltip" :name="mdiInformationOutline">
                  <q-tooltip>
                    {{ fieldData.tooltip }}
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>

            <password-strength-bar
              v-if="fieldData.field === 'password'"
              :password-to-check="user[fieldData.field]"
              :steps="STRENGTH_BAR_STEPS"
            />
          </template>

          <q-btn
            class="full-width"
            color="primary"
            :label="t('auth.register')"
            type="submit"
            :loading="isRegistering"
            data-cy="submit-button"
          />
        </q-form>
      </q-card-section>

      <template v-if="SOCIAL_LOGIN_ENABLED">
        <q-separator />

        <q-card-section class="column gap-8 no-padding">
          <span class="text-black-87 text-center">
            {{ t("common.or") }}
          </span>

          <social-auth-buttons type="register" />
        </q-card-section>
      </template>

      <q-separator />

      <q-card-section class="column gap-16 items-center no-padding">
        <span class="text-dark text-subtitle1">
          {{ t("auth.alreadyRegistered") }}
        </span>

        <q-btn
          :label="t('auth.goToLogin')"
          class="full-width outline-black-12"
          outline
          to="login"
        />
      </q-card-section>

      <q-separator />

      <router-link
        :to="{ name: AvailableRouteNames.ForgotPassword }"
        class="text-black-87 text-center text-subtitle1"
        data-cy="forgot-password-link"
      >
        {{ t("auth.forgotPassword") }}
      </router-link>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ApolloError } from "@apollo/client/core";
import {
  mdiEye,
  mdiEyeOff,
  mdiInformationOutline,
} from "@quasar/extras/mdi-v7";
import { omit } from "lodash-es";
import { QInputProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import SocialAuthButtons from "components/social-auth-buttons.vue";
import { RegisterUserPayload } from "src/@generated/graphql";
import { STRENGTH_BAR_STEPS } from "src/components/models";
import PasswordStrengthBar from "src/components/password-strength-bar.vue";
import { useTheme } from "src/composables/use-theme";
import { notifyError } from "src/helpers/error-messages";
import {
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { AvailableRouteNames } from "src/models/routes";
import { useRegisterMutation } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

const SOCIAL_LOGIN_ENABLED = process.env.SOCIAL_LOGIN_ENABLED === "true";

const { t, locale } = useI18n();

const { theme } = useTheme();

const showPassword = ref(false);

type UserRegistrationData = Omit<
  RegisterUserPayload,
  "discount" | "retailLocationId" | "notes" | "dateOfBirth"
> & {
  confirmEmail: string;
  dateOfBirth: string;
};

const user = ref<UserRegistrationData>({
  email: "",
  firstname: "",
  lastname: "",
  password: "",
  confirmEmail: "",
  phoneNumber: "",
  passwordConfirmation: "",
  dateOfBirth: "",
});

const { register, loading: isRegistering } = useRegisterMutation();

const emailMatchRule = makeValueMatchRule(
  () => user.value.confirmEmail,
  () => t("auth.emailsDoNotMatch"),
);
const passwordMatchRule = makeValueMatchRule(
  () => user.value.password,
  () => t("auth.passwordDoNotMatch"),
);

const formData = computed<
  {
    field: keyof UserRegistrationData;
    tooltip?: string;
    inputData: Omit<QInputProps, "modelValue">;
  }[]
>(() => [
  {
    field: "firstname",
    inputData: {
      label: t("auth.firstName"),
      rules: [requiredRule],
    },
  },
  {
    field: "lastname",
    inputData: {
      label: t("auth.lastName"),
      rules: [requiredRule],
    },
  },
  {
    field: "dateOfBirth",
    inputData: {
      label: t("auth.birthDate"),
      type: "date",
      rules: [requiredRule],
    },
  },
  {
    field: "delegate",
    inputData: {
      label: t("auth.nameOfDelegate"),
      rules: [
        new Date().getUTCFullYear() -
          new Date(user.value.dateOfBirth).getUTCFullYear() <
        18
          ? requiredRule
          : () => true,
      ],
      tooltip: t("auth.delegateLabel"),
    },
  },
  {
    field: "phoneNumber",
    inputData: {
      label: t("auth.phoneNumber"),
      type: "tel",
    },
  },
  {
    field: "email",
    inputData: {
      label: t("auth.emailAddress"),
      rules: [requiredRule],
    },
  },
  {
    field: "confirmEmail",
    inputData: {
      label: t("auth.confirmEmail"),
      rules: [requiredRule, emailMatchRule],
    },
  },
  {
    field: "password",
    inputData: {
      label: t("auth.password"),
      rules: [requiredRule, validatePasswordRule],
      type: showPassword.value ? "text" : "password",
    },
  },
  {
    field: "passwordConfirmation",
    inputData: {
      label: t("auth.confirmPassword"),
      rules: [requiredRule, passwordMatchRule],
      type: showPassword.value ? "text" : "password",
    },
  },
]);

const { selectedLocation } = useRetailLocationService();
async function onSubmit() {
  try {
    await register({
      input: {
        ...omit(user.value, ["confirmEmail"]),
        retailLocationId: selectedLocation.value.id,
        delegate: user.value.delegate,
        locale: locale.value,
        dateOfBirth: Date.parse(user.value.dateOfBirth),
      },
    });
  } catch (error) {
    const { message, graphQLErrors } = error as ApolloError;
    const status = graphQLErrors[0]?.extensions?.status as number | undefined;

    // TODO: implement centralized error handling

    notifyError(message, "registration-error");

    if (!status || ![401, 422].includes(status)) {
      console.error(error);
    }
  }
}
</script>

<style lang="scss" scoped>
$breakpoint-smaller: 400px;
$breakpoint-medium: 700px;
$breakpoint-large: 1200px;
$breakpoint-extra-large: 1640px;
$form-width: 308px;
$registration-page-padding-lg: 25px 100px;
$registration-page-padding-sm: 50px;
$registration-page-padding: 50px 16px;

.registration-page {
  padding: $registration-page-padding;

  @media screen and (min-width: $breakpoint-smaller) {
    padding: $registration-page-padding-sm;
  }

  @media screen and (min-width: $breakpoint-medium) {
    flex-direction: row;
  }

  @media screen and (min-width: $breakpoint-large) {
    padding: $registration-page-padding-lg;
  }
}

.form-card {
  @media screen and (min-width: $breakpoint-medium) {
    max-width: $form-width;
    width: 100%;
  }
}

.outline-black-12::before {
  border-color: rgb(0 0 0 / 12%);
}
</style>
