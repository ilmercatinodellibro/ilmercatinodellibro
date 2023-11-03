<template>
  <q-page class="column items-center justify-center q-pa-xl">
    <q-card
      class="bg-transparent border-none column min-width-315 text-center"
      flat
    >
      <q-form ref="formRef" greedy @submit="onSubmit">
        <q-card-section class="q-pt-none text-h4 text-secondary">
          {{ t("auth.resetPassword") }}
        </q-card-section>
        <q-card-section class="q-pt-none">
          <k-password-input
            v-model="passwordPayload.currentPassword"
            v-model:show="showPassword"
            :rules="[requiredRule]"
            :label="t(`auth.addCurrentPassword`)"
            outlined
            lazy-rules
            autocomplete="password"
          />
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
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            class="full-width"
            :label="t('auth.reset')"
            type="submit"
            :loading="isResettingPassword"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { Notify, QForm } from "quasar";
import { Ref, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import PasswordStrengthBar from "components/password-strength-bar.vue";
import { PasswordResetPayload } from "src/@generated/graphql";
import KPasswordInput from "src/components/k-password-input.vue";
import { STRENGTH_BAR_STEPS } from "src/components/models";
import { notifyError } from "src/helpers/error-messages";
import {
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { ServerError } from "src/models/server";
import { useResetPasswordMutation } from "src/services/auth.graphql";

const showPassword = ref(false);

const passwordPayload = reactive<PasswordResetPayload>({
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

const { t } = useI18n();

const { resetPassword, loading: isResettingPassword } =
  useResetPasswordMutation();

const formRef = ref() as Ref<QForm>;

const passwordMatchRule = makeValueMatchRule(
  () => passwordPayload.newPassword,
  () => t("auth.passwordDoNotMatch"),
);

async function onSubmit() {
  try {
    // Destructuring removes Vue proxy object helper properties
    await resetPassword({ input: { ...passwordPayload } });

    Notify.create({
      message: t("auth.passwordChangedSuccessfully"),
      color: "positive",
    });
    formRef.value.reset();
    passwordPayload.currentPassword = "";
    passwordPayload.newPassword = "";
    passwordPayload.confirmNewPassword = "";
  } catch (e) {
    const { message, status } = e as ServerError;

    // TODO: implement centralized error handling

    notifyError(message);

    if (![400, 404].includes(status)) {
      throw e;
    }
  }
}
</script>
