<template>
  <meta name="referrer" content="no-referrer" />
  <q-page class="column items-center justify-center q-pa-xl">
    <q-card
      class="bg-transparent border-none column min-width-315 text-center"
      flat
    >
      <q-form greedy @submit="onSubmit">
        <q-card-section class="q-pt-none text-h4 text-secondary">
          {{ t("auth.resetPassword") }}
        </q-card-section>
        <q-card-section class="q-pt-none">
          <k-password-input
            v-model="passwordPayload.newPassword"
            v-model:show="showPassword"
            :rules="[requiredRule, validatePasswordRule]"
            :label="t(`auth.addNewPassword`)"
            outlined
            lazy-rules
            autocomplete="password"
            data-cy="password-field"
          />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <password-strength-bar
            :password-to-check="passwordPayload.newPassword"
            :steps="STRENGTH_BAR_STEPS"
          />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <k-password-input
            v-model="passwordPayload.confirmNewPassword"
            v-model:show="showPassword"
            :rules="[requiredRule, passwordMatchRule]"
            :label="t(`auth.confirmPassword`)"
            outlined
            lazy-rules
            autocomplete="password"
            data-cy="password-confirmation-field"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            class="full-width"
            :label="t('auth.reset')"
            type="submit"
            :loading="isResettingPassword"
            data-cy="submit-button"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ApolloError } from "@apollo/client/core";
import { Notify, QForm } from "quasar";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import PasswordStrengthBar from "components/password-strength-bar.vue";
import { ResetForgottenPasswordPayload } from "src/@generated/graphql";
import KPasswordInput from "src/components/k-password-input.vue";
import { STRENGTH_BAR_STEPS } from "src/components/models";
import { notifyError } from "src/helpers/error-messages";
import {
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { useAuthService } from "src/services/auth";
import { useResetForgottenPasswordMutation } from "src/services/auth.graphql";

const props = defineProps<{
  token: string;
}>();

const showPassword = ref(false);

const passwordPayload = reactive<ResetForgottenPasswordPayload>({
  newPassword: "",
  confirmNewPassword: "",
});

const { t } = useI18n();

const { resetForgottenPassword, loading: isResettingPassword } =
  useResetForgottenPasswordMutation();

const router = useRouter();

const passwordMatchRule = makeValueMatchRule(
  () => passwordPayload.newPassword,
  () => t("auth.passwordDoNotMatch"),
);

const { getJwtHeader } = useAuthService();

async function onSubmit() {
  try {
    await resetForgottenPassword(
      {
        input: { ...passwordPayload },
      },
      // We override the request context to add the one-shot JWT token header
      // See https://www.apollographql.com/docs/react/data/mutations#context
      { context: { headers: getJwtHeader(props.token) } },
    );
    Notify.create({
      message: t("auth.passwordChangedSuccessfully"),
      color: "positive",
    });
    void router.push({ name: "login" });
  } catch (error) {
    const { message, graphQLErrors } = error as ApolloError;
    const status = graphQLErrors[0]?.extensions?.status as number | undefined;

    // TODO: implement centralized error handling

    notifyError(message);

    if (!status || ![400, 404].includes(status)) {
      throw error;
    }
  }
}
</script>
