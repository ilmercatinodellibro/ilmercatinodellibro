<template>
  <q-btn
    v-if="GOOGLE_LOGIN_ENABLED"
    :href="`/auth/google?locationId=${selectedLocation.id}`"
    icon="svguse:/icons.svg#google"
    :label="
      t(type === 'login' ? 'auth.loginWith' : 'auth.registerWith', {
        provider: 'Google',
      })
    "
    class="google-button text-weight-regular"
    color="black-87"
    outline
    no-caps
  />

  <q-btn
    v-if="FACEBOOK_LOGIN_ENABLED"
    :href="`/auth/facebook?locationId=${selectedLocation.id}`"
    icon="svguse:/icons.svg#facebook"
    :label="
      t(type === 'login' ? 'auth.loginWith' : 'auth.registerWith', {
        provider: 'Facebook',
      })
    "
    color="facebook-blue"
    class="text-weight-regular"
    outline
    no-caps
  />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRetailLocationService } from "src/services/retail-location";

defineProps<{
  type: "login" | "register";
}>();

const { selectedLocation } = useRetailLocationService();
const { t } = useI18n();

const GOOGLE_LOGIN_ENABLED = process.env.GOOGLE_LOGIN_ENABLED === "true";
const FACEBOOK_LOGIN_ENABLED = process.env.FACEBOOK_LOGIN_ENABLED === "true";
</script>

<style lang="scss" scoped>
.google-button {
  &::before {
    border-color: rgb(0 0 0 / 54%);
  }

  :deep(.q-icon) {
    width: 20px;
    height: 20px;
  }
}
</style>
