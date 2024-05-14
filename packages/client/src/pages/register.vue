<template>
  <!-- TODO: Adjust the page to the new mockup -->
  <q-page class="column justify-center registration-page">
    <div class="items-center justify-center row">
      <q-card class="form-card full-width text-center">
        <q-form greedy @submit="onSubmit">
          <q-card-section class="text-dark text-h4">
            {{ t("auth.register") }}
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="user.firstname"
              :rules="[requiredRule]"
              type="text"
              outlined
              lazy-rules
              :label="t('auth.firstName')"
              data-cy="name-field"
            />
            <q-input
              v-model="user.lastname"
              :rules="[requiredRule]"
              lazy-rules
              :label="t('auth.lastName')"
              outlined
              type="text"
              data-cy="surname-field"
            />
            <q-input
              v-model="user.email"
              :rules="[requiredRule, emailRule]"
              lazy-rules
              :label="t('auth.email')"
              outlined
              type="email"
              data-cy="email-field"
            />
            <k-password-input
              v-model="user.password"
              v-model:show="showPassword"
              :rules="[requiredRule, validatePasswordRule]"
              :label="t('auth.password')"
              outlined
              lazy-rules
              autocomplete="password"
              data-cy="password-field"
            />
            <password-strength-bar
              :password-to-check="user.password"
              :steps="STRENGTH_BAR_STEPS"
            />
            <k-password-input
              v-model="user.passwordConfirmation"
              v-model:show="showPassword"
              :rules="[requiredRule, passwordMatchRule]"
              :label="t('auth.confirmPassword')"
              outlined
              lazy-rules
              autocomplete="password"
              data-cy="password-confirmation-field"
            />
          </q-card-section>

          <q-card-section>
            <q-btn
              class="full-width"
              color="accent"
              :label="t('auth.register')"
              text-color="black-54"
              type="submit"
              :loading="isRegistering"
              data-cy="submit-button"
            />
          </q-card-section>

          <template v-if="SOCIAL_LOGIN_ENABLED">
            <q-separator inset spaced />

            <q-card-section class="column gap-8">
              <span class="text-black-87">{{ t("common.or") }}</span>

              <social-auth-buttons type="register" />
            </q-card-section>
          </template>

          <q-separator inset spaced />

          <q-card-section>
            <span class="text-dark text-subtitle1">
              {{ t("common.or") }}&nbsp;
              <router-link to="login" class="text-dark">
                {{ t("auth.login") }}
              </router-link>
            </span>
          </q-card-section>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ApolloError } from "@apollo/client/core";
import { reactive, ref, toRaw } from "vue";
import { useI18n } from "vue-i18n";
import PasswordStrengthBar from "components/password-strength-bar.vue";
import SocialAuthButtons from "components/social-auth-buttons.vue";
import { RegisterPayload } from "src/@generated/graphql";
import KPasswordInput from "src/components/k-password-input.vue";
import { STRENGTH_BAR_STEPS } from "src/components/models";
import { notifyError } from "src/helpers/error-messages";
import {
  emailRule,
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { useRegisterMutation } from "src/services/auth";

const SOCIAL_LOGIN_ENABLED = process.env.SOCIAL_LOGIN_ENABLED === "true";

const { t } = useI18n();

const showPassword = ref(false);

const user = reactive<RegisterPayload>({
  email: "",
  firstname: "",
  lastname: "",
  password: "",
  passwordConfirmation: "",
});

const { register, loading: isRegistering } = useRegisterMutation();

const passwordMatchRule = makeValueMatchRule(
  () => user.password,
  () => t("auth.passwordDoNotMatch"),
);

async function onSubmit() {
  try {
    await register({ input: toRaw(user) });
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
  }
}
</style>
