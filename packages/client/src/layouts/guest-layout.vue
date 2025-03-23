<template>
  <q-layout view="lHh Lpr lFf">
    <header-bar />

    <app-drawer v-if="isMobile">
      <q-item v-ripple clickable :to="{ name: AvailableRouteNames.Login }">
        <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
          {{ t("routesNames.login") }}
        </q-tooltip>
        <q-item-section side>
          <q-icon :name="mdiAccount" color="black-54" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="ellipsis text-size-16">
            {{ t("routesNames.login") }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item v-ripple clickable :to="{ name: AvailableRouteNames.Contacts }">
        <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
          {{ t("routesNames.contacts") }}
        </q-tooltip>
        <q-item-section side>
          <q-icon :name="mdiPhone" color="black-54" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="ellipsis text-size-16">
            {{ t("routesNames.contacts") }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item v-ripple clickable :to="{ name: AvailableRouteNames.WhoWeAre }">
        <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
          {{ t("routesNames.who-we-are") }}
        </q-tooltip>
        <q-item-section side>
          <q-icon :name="mdiHelpCircle" color="black-54" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="ellipsis text-size-16">
            {{ t("routesNames.who-we-are") }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item v-ripple clickable :to="{ name: AvailableRouteNames.JoinUs }">
        <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
          {{ t("routesNames.join-us") }}
        </q-tooltip>
        <q-item-section side>
          <q-icon :name="mdiHandshake" color="black-54" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="ellipsis text-size-16">
            {{ t("routesNames.join-us") }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </app-drawer>

    <q-page-container class="layout-background">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {
  mdiAccount,
  mdiHandshake,
  mdiHelpCircle,
  mdiPhone,
} from "@quasar/extras/mdi-v7";
import { QTooltipProps } from "quasar";
import { useI18n } from "vue-i18n";
import AppDrawer from "src/components/app-drawer.vue";
import HeaderBar from "src/components/header-bar.vue";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { AvailableRouteNames } from "src/models/routes";

const TOOLTIP_SHARED_PROPS: QTooltipProps = {
  offset: [10, 20],
  anchor: "center right",
  self: "center left",
};

const { t } = useI18n();

const { isMobile, isDrawerMini } = useLateralDrawer();
</script>
