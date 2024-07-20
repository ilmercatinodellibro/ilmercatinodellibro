<!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
<template>
  <header-bar v-if="user" />
  <q-page class="flex-center q-pa-md row">
    <div class="max-width-700">
      <h3 class="text-primary">
        {{ t("general.joinUs") }}
      </h3>

      <div
        class="prevent-links-highlight"
        v-html="selectedLocation.infoPagesContent[locale].joinUsContent"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

const { user } = useAuthService();
const HeaderBar = defineAsyncComponent(
  () => import("src/components/header-bar.vue"),
);

const { selectedLocation } = useRetailLocationService();

const { t, locale } = useI18n();
</script>
