<template>
  <q-page class="flex items-center justify-center">
    <q-card class="form-card text-center">
      <q-form greedy @submit="onSubmit">
        <q-card-section class="text-dark text-h3">
          {{ t("auth.login") }}
        </q-card-section>

        <q-card-section class="input-container">
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
            color="accent"
            :label="t('auth.login')"
            text-color="black-54"
            type="submit"
            data-cy="submit-button"
            :loading="isLoggingIn"
          />
        </q-card-section>

        <q-card-section>
          <router-link
            class="text-dark text-subtitle1"
            :to="{ name: 'forgot-password' }"
            data-cy="forgot-password-link"
          >
            {{ t("auth.forgotPassword") }}
          </router-link>
        </q-card-section>

        <q-card-section>
          <p class="text-dark">{{ t("auth.noAccount") }}</p>
          <router-link
            class="text-dark text-subtitle1"
            :to="{ name: 'registration' }"
            data-cy="registration-link"
          >
            {{ $t("auth.register") }}
          </router-link>
        </q-card-section>
      </q-form>

      <q-separator />

      <q-card-section>
        <!-- TODO: Make this link dynamic -->
        <q-btn
          :href="`http://localhost:3000/auth/facebook?locationId=${selectedLocation.id}`"
          :icon="mdiFacebook"
          color="blue"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ApolloError } from "@apollo/client/core";
import { mdiFacebook } from "@quasar/extras/mdi-v7";
import { Notify } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { LoginPayload } from "src/@generated/graphql";
import KPasswordInput from "src/components/k-password-input.vue";
import { notifyError } from "src/helpers/error-messages";
import { emailRule, requiredRule } from "src/helpers/rules";
import { useLoginMutation } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

const props = defineProps<{
  emailVerified?: boolean;
}>();

const { t } = useI18n();

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
$form-width: 300px;

.input-container {
  > *:not(:last-child) {
    margin-bottom: 12px;
  }

  > *:last-child {
    margin-bottom: unset;
  }
}

.form-card {
  max-width: $form-width;
  width: 100%;
}
</style>
