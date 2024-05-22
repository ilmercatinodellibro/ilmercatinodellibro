<template>
  <q-card-section class="column faq-container no-wrap width-700">
    <h3 class="text-primary">{{ t("routesNames.faq") }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="selectedLocation.faqContent" />
  </q-card-section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRetailLocationService } from "src/services/retail-location";

const { t } = useI18n();
const { selectedLocation } = useRetailLocationService();
</script>

<style lang="scss">
.faq-container a {
  color: $accent;
  text-decoration: none;
}
</style>
