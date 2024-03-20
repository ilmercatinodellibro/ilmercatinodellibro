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
          v-if="!currentRouteIsLogin"
          :icon="mdiArrowLeft"
          color="accent"
          :label="t('auth.backToLogin')"
          :to="{ name: AvailableRouteNames.Login }"
        />
        <span v-if="user">
          <img :src="theme.logo" class="header-logo" />
          <q-separator vertical inset color="white-12" class="q-mx-md" />
        </span>
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

      <!-- [1] - We're already sure of user existence thanks to auth route guards, this check is only needed to make TS happy -->
      <!-- [1] -->
      <user-item
        v-if="user && !isLayoutHeaderXs"
        :user="user"
        class="q-mx-md"
        data-cy="user-item"
      />
    </k-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { mdiArrowLeft } from "@quasar/extras/mdi-v7";
import { Screen } from "quasar";
import { computed, provide } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { IsLayoutHeaderXsInjectionKey } from "src/composables/header-features/models";
import { provideHeaderFilters } from "src/composables/header-features/use-header-filters";
import { provideHeaderName } from "src/composables/header-features/use-header-name-button";
import { provideHeaderSearch } from "src/composables/header-features/use-header-search";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { useTheme } from "src/composables/use-theme";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService } from "src/services/auth";
import kToolbar from "./k-toolbar.vue";
import userItem from "./user-item.vue";

const { isDrawerOpen, showLateralDrawer } = useLateralDrawer();
const { isHeaderSearchEnabled, searchText } = provideHeaderSearch();
const {
  compareFunction,
  filterOptions,
  isHeaderFiltersEnabled,
  selectedFilter,
} = provideHeaderFilters();
const { headerName } = provideHeaderName();
const { theme } = useTheme();
const { user } = useAuthService();
const isLayoutHeaderXs = computed(() => Screen.lt.sm);
provide(IsLayoutHeaderXsInjectionKey, isLayoutHeaderXs);
const { t } = useI18n();

const router = useRouter();
const currentRouteIsLogin = computed(
  () => router.currentRoute.value.name === AvailableRouteNames.Login,
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
