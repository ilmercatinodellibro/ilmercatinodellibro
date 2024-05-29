<template>
  <q-page class="flex items-center justify-center">
    <q-card class="column form-card gap-24 q-pa-lg text-center">
      <q-img :src="theme.logo" fit="contain" height="60px" />
      <h3 class="no-margin text-primary">{{ t("auth.resetPassword") }}</h3>
      <q-form greedy class="column gap-24" @submit="onSubmit">
        <q-card-section class="no-padding text-dark text-justify">
          {{ t("auth.noWorries") }}
        </q-card-section>
        <q-card-section class="column gap-8 no-padding">
          <q-input
            v-model="email"
            :rules="[requiredRule, emailRule]"
            :label="t('auth.email')"
            lazy-rules
            outlined
            type="email"
            data-cy="email-field"
          />
          <q-btn
            class="full-width"
            color="primary"
            :label="t('actions.submit')"
            type="submit"
            data-cy="submit-button"
            :loading="isLoading"
          />
        </q-card-section>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useTheme } from "src/composables/use-theme";
import { notifyError } from "src/helpers/error-messages";
import { emailRule, requiredRule } from "src/helpers/rules";
import { ServerError } from "src/models/server";
import { useSendPasswordResetLinkMutation } from "src/services/auth.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { t } = useI18n();

const router = useRouter();

const email = ref("");

const { selectedLocation } = useRetailLocationService();
const { sendPasswordResetLink, loading: isLoading } =
  useSendPasswordResetLinkMutation();

const { theme } = useTheme();

async function onSubmit() {
  try {
    await sendPasswordResetLink({
      input: {
        email: email.value,
        retailLocationId: selectedLocation.value.id,
      },
    });
    void router.push({ name: "reset-password-link-sent" });
  } catch (e) {
    const { message, status } = e as ServerError;

    // TODO: implement centralized error handling

    notifyError(message);

    if (![401, 422].includes(status)) {
      throw e;
    }
  }
}
</script>

<style lang="scss" scoped>
$form-width: 300px;

.form-card {
  max-width: $form-width;
  width: 100%;
}
</style>
