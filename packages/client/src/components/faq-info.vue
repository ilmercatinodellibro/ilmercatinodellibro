<!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
<template>
  <div class="column max-width-700 no-wrap">
    <h3 class="text-primary">{{ t("routesNames.faq") }}</h3>
    <div
      :class="isMobile ? 'min-width-auto' : undefined"
      v-html="selectedLocation.infoPagesContent?.[locale].faqContent"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { useRetailLocationService } from "src/services/retail-location";

const { t, locale } = useI18n();
const { selectedLocation } = useRetailLocationService();
const { isMobile } = useLateralDrawer();
</script>

<style lang="scss" scoped>
:deep(a) {
  color: $accent;
  text-decoration: none;
}

// To display Reggio's bottom FAQ sections correctly on mobile
.min-width-auto :deep(.row > *) {
  min-width: auto;
}
</style>
