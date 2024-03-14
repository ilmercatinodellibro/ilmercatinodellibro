<!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
<template>
  <q-page class="flex-center row">
    <span class="width-700">
      <h3 class="text-primary">
        {{ t("general.joinUs") }}
      </h3>

      <q-card-section
        class="default-color no-padding"
        v-html="selectedRetailLocation?.joinUsContent"
      />
    </span>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRetailLocations } from "src/composables/use-retail-location";

const { selectedRetailLocation } = useRetailLocations();

const { t } = useI18n();
</script>
