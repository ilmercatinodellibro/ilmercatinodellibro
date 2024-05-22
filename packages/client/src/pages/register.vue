<template>
  <!-- TODO: Adjust the page to the new mockup -->
  <q-page class="justify-center registration-page row">
    <q-card class="column form-card gap-24 items-stretch no-wrap q-pa-lg">
      <q-card-section class="column gap-24 no-padding no-wrap">
        <q-img :src="theme.logo" fit="contain" height="60px" />

        <q-form
          class="column gap-8 items-stretch justify-center no-padding"
          greedy
          @submit="onSubmit"
        >
          <q-input
            v-for="{ field, tooltip, ...inputData } in formData"
            :key="field"
            v-model="user[field]"
            v-bind="inputData"
            :autocomplete="
              [
                'password',
                'passwordConfirmation',
                'email',
                'confirmEmail',
              ].includes(field)
                ? 'new-password'
                : 'off'
            "
            bottom-slots
            class="width-260"
            lazy-rules
            outlined
          >
            <template
              v-if="
                ['password', 'passwordConfirmation', 'delegate'].includes(field)
              "
              #append
            >
              <q-icon
                v-if="field === 'password' || field === 'passwordConfirmation'"
                :name="showPassword ? mdiEyeOff : mdiEye"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />

              <q-icon v-if="tooltip" :name="mdiInformationOutline">
                <q-tooltip>
                  {{ tooltip }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>

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
import { QInputProps } from "quasar";
import { computed, reactive, ref, toRaw } from "vue";
import { useI18n } from "vue-i18n";
import SocialAuthButtons from "components/social-auth-buttons.vue";
import { RegisterUserPayload } from "src/@generated/graphql";
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

const user = reactive<UserRegistrationData>({
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
  () => user.confirmEmail,
  () => t("auth.emailsDoNotMatch"),
);
const passwordMatchRule = makeValueMatchRule(
  () => user.password,
  () => t("auth.passwordDoNotMatch"),
);

const formData = computed<
  ({ field: keyof UserRegistrationData; tooltip?: string } & Omit<
    QInputProps,
    "modelValue"
  >)[]
>(() => [
  {
    field: "firstname",
    label: t("auth.firstName"),
    rules: [requiredRule],
  },
  {
    field: "lastname",
    label: t("auth.lastName"),
    rules: [requiredRule],
  },
  {
    field: "dateOfBirth",
    label: t("auth.birthDate"),
    type: "date",
  },
  {
    field: "delegate",
    label: t("auth.nameOfDelegate"),
    rules:
      user.dateOfBirth &&
      new Date().getUTCFullYear() -
        new Date(user.dateOfBirth).getUTCFullYear() <
        18
        ? [requiredRule]
        : undefined,
    tooltip: t("auth.delegateLabel"),
  },
  {
    field: "phoneNumber",
    label: t("auth.phoneNumber"),
    type: "tel",
  },
  {
    field: "email",
    label: t("auth.emailAddress"),
    rules: [requiredRule],
  },
  {
    field: "confirmEmail",
    label: t("auth.confirmEmail"),
    rules: [requiredRule, emailMatchRule],
  },
  {
    field: "password",
    label: t("auth.password"),
    rules: [requiredRule, validatePasswordRule],
    type: showPassword.value ? "text" : "password",
  },
  {
    field: "passwordConfirmation",
    label: t("auth.confirmPassword"),
    rules: [requiredRule, passwordMatchRule],
    type: showPassword.value ? "text" : "password",
  },
]);

const { selectedLocation } = useRetailLocationService();
async function onSubmit() {
  try {
    await register({
      input: {
        ...toRaw(user),
        locale: locale.value,
        retailLocationId: selectedLocation.value.id,
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
