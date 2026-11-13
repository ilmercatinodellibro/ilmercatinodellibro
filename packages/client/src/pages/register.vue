<!-- eslint-disable vue/no-v-html -->
<template>
  <q-page class="justify-center registration-page row">
    <q-card class="column form-card gap-24 items-stretch no-wrap q-pa-lg">
      <q-card-section class="column gap-24 no-padding no-wrap">
        <q-img :src="theme.logo" fit="contain" height="60px" />

        <q-form
          :id="`register-form-${uid()}`"
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
              class="full-width"
              :data-testid="`${kebabCase(fieldData.field)}-field`"
              lazy-rules
              outlined
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
            data-testid="submit-button"
          />
        </q-form>
      </q-card-section>

      <span
        class="privacy-links text-center"
        v-html="
          t('auth.privacyAndToSRegister', {
            retailLocationId: selectedLocation.id,
            locale,
          })
        "
      />

      <template v-if="SOCIAL_LOGIN_ENABLED">
        <q-separator />

        <q-card-section class="column gap-8 no-padding">
          <span class="text-black-87 text-center">
            {{ t("common.or") }}
          </span>

          <social-auth-buttons type="register" />
        </q-card-section>
      </template>

      <template v-if="!props.token">
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
      </template>

      <q-separator />

      <router-link
        :to="{ name: AvailableRouteNames.ForgotPassword }"
        class="text-black-87 text-center text-subtitle1"
        data-testid="forgot-password-link"
      >
        {{ t("auth.forgotPassword") }}
      </router-link>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiEye,
  mdiEyeOff,
  mdiInformationOutline,
} from "@quasar/extras/mdi-v7";
import { kebabCase, omit } from "lodash-es";
import { Notify, type QInputProps, uid } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { RegisterUserPayload } from "@/@generated/graphql";
import { STRENGTH_BAR_STEPS } from "@/components/models";
import PasswordStrengthBar from "@/components/password-strength-bar.vue";
import SocialAuthButtons from "@/components/social-auth-buttons.vue";
import { useTheme } from "@/composables/use-theme";
import {
  isExpectedServerError,
  notifyServerError,
} from "@/helpers/error-messages";
import {
  emailRule,
  makeValueMatchRule,
  phoneNumberRules,
  requireIfUnderage,
  requiredRule,
  validatePasswordRule,
} from "@/helpers/rules";
import { AvailableRouteNames } from "@/models/routes";
import { useAuthService, useRegisterMutation } from "@/services/auth";
import { useRegisterWithTokenMutation } from "@/services/auth.graphql";
import { useRetailLocationService } from "@/services/retail-location";

const props = defineProps<{
  token?: string;
  email?: string;
}>();

const { SOCIAL_LOGIN_ENABLED } = import.meta.env;

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

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- the props only fill in the initial form values
const user = ref<UserRegistrationData>({
  email: props.email ?? "",
  firstname: "",
  lastname: "",
  password: "",
  confirmEmail: props.email ?? "",
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

interface FormField {
  field: keyof UserRegistrationData;
  tooltip?: string;
  inputData: Omit<QInputProps, "modelValue">;
}

// TODO: unify with edit-user-details-dialog and edit-user-data-dialog
const formData = computed<FormField[]>(() => [
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
      rules: [requireIfUnderage(user.value.dateOfBirth)],
      tooltip: t("auth.delegateLabel"),
    },
  },
  {
    field: "phoneNumber",
    inputData: {
      label: t("auth.phoneNumber"),
      type: "tel",
      rules: phoneNumberRules,
    },
  },
  {
    field: "email",
    inputData: {
      label: t("auth.emailAddress"),
      type: "email",
      rules: [requiredRule, emailRule],
      readonly: !!props.email,
    },
  },
  ...(props.email
    ? []
    : [
        {
          field: "confirmEmail",
          inputData: {
            label: t("auth.confirmEmail"),
            rules: [requiredRule, emailMatchRule],
          },
        } satisfies FormField,
      ]),
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
const { registerWithToken } = useRegisterWithTokenMutation();
const { getJwtHeader } = useAuthService();
const router = useRouter();
async function onSubmit() {
  try {
    const registrationData = {
      input: {
        ...omit(user.value, ["confirmEmail"]),
        dateOfBirth: Date.parse(user.value.dateOfBirth),
        retailLocationId: selectedLocation.value.id,
        locale: locale.value,
      },
    };

    await (props.token
      ? registerWithToken(
          registrationData,
          // We override the request context to add the one-shot JWT token header
          // See https://www.apollographql.com/docs/react/data/mutations#context
          { context: { headers: getJwtHeader(props.token) } },
        )
      : register(registrationData));

    await router.push({ name: "login" });

    Notify.create({
      message: t("auth.registeredSuccessfully"),
      color: "positive",
    });
  } catch (error) {
    notifyServerError(error, "registration-error");

    if (!isExpectedServerError(error)) {
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

:deep(.privacy-links > a) {
  text-decoration: none;
}

.outline-black-12::before {
  border-color: rgb(0 0 0 / 12%);
}
</style>
