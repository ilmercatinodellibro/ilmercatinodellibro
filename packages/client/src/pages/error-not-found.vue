<template>
  <div
    class="bg-blue flex flex-center fullscreen q-pa-md text-center text-white"
  >
    <div>
      <!-- eslint-disable-next-line vue/no-bare-strings-in-template -->
      <div class="error-code">404</div>

      <div class="error-message text-h2">
        {{ t("general.oopsNothingHere") }}...
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        :label="t('general.goHome')"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style lang="scss">
.error-code {
  font-size: 30vh;
}

.error-message {
  opacity: 0.4;
}
</style>
