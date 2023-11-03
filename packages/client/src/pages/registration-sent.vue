<template>
  <q-page class="flex items-center justify-center">
    <q-card flat>
      <q-card-section class="text-dark text-h3">
        {{ t("auth.verificationEmailSent") }}
      </q-card-section>
      <q-card-section class="text-dark text-h6">
        <p>{{ t("auth.pleaseCheckYourInboxForVerificationEmail") }}</p>
      </q-card-section>
      <q-card-section>
        <q-btn
          :label="t('auth.backToLogin')"
          class="full-width"
          color="accent"
          text-color="black-54"
          :to="{ name: 'login' }"
          data-cy="back-to-login-link"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
