<template>
  <q-page class="gap-32 items-start justify-evenly q-pa-lg reverse row">
    <q-card class="column form-card gap-24 q-my-xl q-pa-lg text-center">
      <q-img :src="theme.logo" fit="contain" height="60px" />

      <q-card-section class="no-padding">
        <q-form greedy class="column gap-8" @submit="onSubmit">
          <q-input
            v-model="user.email"
            :rules="[requiredRule, emailRule]"
            :label="t('auth.email')"
            lazy-rules
            outlined
            type="email"
            data-cy="email-field"
          />

          <k-password-input
            v-model="user.password"
            v-model:show="showPassword"
            :rules="[requiredRule]"
            :label="t('auth.password')"
            outlined
            lazy-rules
            autocomplete="password"
            data-cy="password-field"
          />

          <q-btn
            class="full-width"
            color="primary"
            :label="t('auth.login')"
            type="submit"
            data-cy="submit-button"
            :loading="isLoggingIn"
          />
        </q-form>
      </q-card-section>

      <template v-if="SOCIAL_LOGIN_ENABLED">
        <q-separator />

        <q-card-section class="column gap-8 no-padding">
          <span class="text-black-87"> {{ t("common.or") }} </span>

          <social-auth-buttons type="login" />
        </q-card-section>
      </template>

      <q-separator />

      <q-card-section class="no-padding">
        <p class="text-black-87">{{ t("auth.noAccount") }}</p>

        <q-btn
          :to="{ name: 'registration' }"
          :label="t('auth.register')"
          class="full-width outline-black-12"
          color="black-87"
          outline
        />
      </q-card-section>

      <q-separator />

      <router-link
        class="text-black-87 text-subtitle1"
        :to="{ name: 'forgot-password' }"
        data-cy="forgot-password-link"
      >
        {{ t("auth.forgotPassword") }}
      </router-link>
    </q-card>

    <faq-info />
  </q-page>
</template>

<script setup lang="ts">
import { ApolloError } from "@apollo/client/core";
import { Notify } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { LoginPayload } from "src/@generated/graphql";
import FaqInfo from "src/components/faq-info.vue";
import KPasswordInput from "src/components/k-password-input.vue";
import SocialAuthButtons from "src/components/social-auth-buttons.vue";
import { useTheme } from "src/composables/use-theme";
import { notifyError } from "src/helpers/error-messages";
import { emailRule, requiredRule } from "src/helpers/rules";
import { useLoginMutation } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

const SOCIAL_LOGIN_ENABLED = process.env.SOCIAL_LOGIN_ENABLED === "true";

const props = defineProps<{
  emailVerified?: boolean;
}>();

const { t } = useI18n();

const { theme } = useTheme();

if (props.emailVerified) {
  Notify.create({
    message: t("auth.emailVerified"),
    color: "positive",
    attrs: {
      "data-cy": "email-verified-notification",
    },
  });
}

const user = ref<LoginPayload>({
  email: "",
  password: "",
});

const showPassword = ref(false);

const { selectedLocation } = useRetailLocationService();
const { login, loading: isLoggingIn } = useLoginMutation();

async function onSubmit() {
  try {
    await login({
      input: user.value,
      retailLocationId: selectedLocation.value.id,
    });
  } catch (error) {
    const { message, graphQLErrors } = error as ApolloError;
    const status = graphQLErrors[0]?.extensions?.status as number | undefined;

    // TODO: implement centralized error handling

    notifyError(message, "login-error");

    if (!status || ![401, 422].includes(status)) {
      console.error(error);
    }
  }
}
</script>

<style lang="scss" scoped>
$form-width: 308px;

.form-card {
  max-width: $form-width;
  width: 100%;
}

.outline-black-12::before {
  border-color: rgb(0 0 0 / 12%);
}
</style>
