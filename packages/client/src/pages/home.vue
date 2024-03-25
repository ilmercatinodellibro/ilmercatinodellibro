<!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
<template>
  <header-bar />
  <q-page class="column flex-center">
    <h3 class="text-primary">
      {{ t("home.title") }}
    </h3>
    <p class="text-accent">{{ t("home.description") }}</p>
    <h4 class="q-my-xl">{{ t("home.actionCall") }}</h4>

    <div class="items-center row wrap">
      <action-box
        v-for="action in actionsList"
        :key="action.to.name"
        :action-text="action.text"
        :button-label="action.label"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { mdiBookOpenBlankVariant, mdiCurrencyEur } from "@quasar/extras/mdi-v7";
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
      icon: mdiCurrencyEur,
      text: t("home.actions.buyBooks.text"),
      label: t("home.actions.buyBooks.buttonLabel"),
      to: { name: AvailableRouteNames.Catalog },
    },
    {
      icon: mdiBookOpenBlankVariant,
      text: t("home.actions.seeMyData.text"),
      label: t("home.actions.seeMyData.buttonLabel"),
      to: { name: AvailableRouteNames.MyBooks },
    },
  ];
});
</script>
