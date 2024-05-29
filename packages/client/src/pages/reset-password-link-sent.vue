<template>
  <q-page class="column flex-center q-pa-xl">
    <q-card class="column form-card gap-24 q-my-xl q-pa-lg text-center">
      <q-img :src="theme.logo" fit="contain" height="60px" />

      <h3 class="no-margin text-primary">
        {{ t("auth.resetPassword") }}
      </h3>

      <q-card-section class="no-padding text-justify">
        {{ t("auth.checkInbox") }}
      </q-card-section>

      <q-btn
        :label="t('auth.backToLogin')"
        class="full-width"
        color="primary"
        to="login"
      />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTheme } from "src/composables/use-theme";

const { t } = useI18n();
const { theme } = useTheme();
</script>

<style scoped lang="scss">
$form-width: 308px;

.form-card {
  max-width: $form-width;
  width: 100%;
}
</style>
