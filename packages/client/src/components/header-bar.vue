<template>
  <q-header>
    <k-toolbar
      v-model:drawer="isDrawerOpen"
      v-model:search-text="searchText"
      :compare-function="compareFunction"
      :enable-drawer="showLateralDrawer"
      :filter-options="filterOptions"
      :is-header-filters-enabled="isHeaderFiltersEnabled"
      :selected-filter="selectedFilter"
      :show-search-bar="isHeaderSearchEnabled"
      :title="headerName"
    >
      <template #left>
        <q-btn
          v-if="showBackToLocations"
          :icon="mdiArrowLeft"
          color="accent"
          :label="t('auth.backToLocations')"
          :to="{ name: AvailableRouteNames.SelectLocation }"
        />

        <q-btn
          v-if="showBackToLogin"
          :icon="mdiArrowLeft"
          color="accent"
          :label="t('auth.backToLogin')"
          :to="{ name: AvailableRouteNames.Login }"
        />
      </template>

      <q-btn
        flat
        stretch
        :label="t('routesNames.who-we-are')"
        :to="{ name: AvailableRouteNames.WhoWeAre }"
      />
      <q-btn
        flat
        stretch
        :label="t('routesNames.join-us')"
        :to="{ name: AvailableRouteNames.JoinUs }"
      />
      <q-btn
        flat
        stretch
        :label="t('routesNames.contacts')"
        :to="{ name: AvailableRouteNames.Contacts }"
      />
      <language-dropdown-btn v-if="!isAuthenticated" />
    </k-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { mdiArrowLeft } from "@quasar/extras/mdi-v7";
import { Screen } from "quasar";
import { computed, provide } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { IsLayoutHeaderXsInjectionKey } from "src/composables/header-features/models";
import { provideHeaderFilters } from "src/composables/header-features/use-header-filters";
import { provideHeaderName } from "src/composables/header-features/use-header-name-button";
import { provideHeaderSearch } from "src/composables/header-features/use-header-search";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService } from "src/services/auth";
import kToolbar from "./k-toolbar.vue";
import LanguageDropdownBtn from "./language-dropdown-btn.vue";

const { isDrawerOpen, showLateralDrawer } = useLateralDrawer();
const { isHeaderSearchEnabled, searchText } = provideHeaderSearch();
const {
  compareFunction,
  filterOptions,
  isHeaderFiltersEnabled,
  selectedFilter,
} = provideHeaderFilters();
const { headerName } = provideHeaderName();
const { user, isAuthenticated } = useAuthService();
const isLayoutHeaderXs = computed(() => Screen.lt.sm);
provide(IsLayoutHeaderXsInjectionKey, isLayoutHeaderXs);
const { t } = useI18n();

const route = useRoute();
const showBackToLocations = computed(
  () => route.name === AvailableRouteNames.Login && !user.value,
);
const showBackToLogin = computed(
  () => route.name !== AvailableRouteNames.Login && !user.value,
);
</script>

<style scoped lang="scss">
$header-height: 64px;

.k-toolbar {
  height: $header-height;

  &::after {
    background-color: rgb(0 0 0 / 12%);
    bottom: 0;
    content: "";
    height: 1px;
    left: 0;
    position: absolute;
    width: 100%;
  }
}
</style>
