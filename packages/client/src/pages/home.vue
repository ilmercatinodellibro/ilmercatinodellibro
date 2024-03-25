<!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
<template>
  <header-bar />
  <q-page class="column flex-center q-pa-md">
    <h4 class="m-mb-36 q-mt-none readability-max-width text-accent">
      {{ t("home.title") }}
    </h4>
    <p
      class="m-mb-36 q-ma-none readability-max-width text-center text-h5 text-primary"
    >
      {{ t("home.description") }}
    </p>
    <h5 class="m-mb-36 q-mt-none readability-max-width text-accent">
      {{ t("home.actionCall") }}
    </h5>

    <div class="items-center justify-center row wrap">
      <action-box
        v-for="action in actionsList"
        :key="action.to.name"
        :button-label="action.label"
        class="home-action"
      >
        <q-icon
          class="q-mb-lg q-mt-xl"
          color="white"
          :name="action.icon"
          size="100px"
        />
        <div
          class="home-action__text-content pre q-mb-lg text-center text-h4 text-white"
        >
          {{ action.text }}
        </div>
      </action-box>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiBookOpenBlankVariant,
  mdiCheckDecagram,
  mdiCurrencyEur,
} from "@quasar/extras/mdi-v7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ActionBox from "src/components/action-box.vue";
import HeaderBar from "src/components/header-bar.vue";
import { AvailableRouteNames } from "src/models/routes";

const { t } = useI18n();

const actionsList = computed(() => {
  return [
    {
      icon: mdiCurrencyEur,
      text: t("home.actions.sellBooks.text"),
      label: t("home.actions.sellBooks.buttonLabel"),
      to: { name: AvailableRouteNames.SalableBooks },
    },
    {
      icon: mdiBookOpenBlankVariant,
      text: t("home.actions.buyBooks.text"),
      label: t("home.actions.buyBooks.buttonLabel"),
      to: { name: AvailableRouteNames.Catalog },
    },
    {
      icon: mdiCheckDecagram,
      text: t("home.actions.seeMyData.text"),
      label: t("home.actions.seeMyData.buttonLabel"),
      to: { name: AvailableRouteNames.MyBooks },
    },
  ];
});
</script>

<style lang="scss" scoped>
.home-action {
  margin: 12px;

  &__text-content {
    min-height: 160px; // Should be like this to respect mockup
  }
}

.readability-max-width {
  max-width: 800px;
}
</style>
