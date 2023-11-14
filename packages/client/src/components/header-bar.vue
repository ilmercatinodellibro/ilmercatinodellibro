<template>
  <q-header>
    <k-toolbar
      v-model:drawer="isDrawerOpen"
      v-model:search-text="searchText"
      :back-route-location="headerBackButtonRouteLocation"
      :compare-function="compareFunction"
      :enable-drawer="showLateralDrawer"
      :filter-options="filterOptions"
      :is-header-filters-enabled="isHeaderFiltersEnabled"
      :selected-filter="selectedFilter"
      :show-search-bar="isHeaderSearchEnabled"
      :title="headerName"
    >
      <template #left>
        <span v-if="user">
          <img :src="theme.logo" class="header-logo" />
          <q-separator vertical inset color="white-12" class="q-mx-md" />
        </span>
      </template>

      <!-- [1] - We're already sure of user existence thanks to auth route guards, this check is only needed to make TS happy -->
      <!-- [1] -->
      <user-item
        v-if="user && !isLayoutHeaderXs"
        :user="user"
        class="q-mx-md"
        data-cy="user-item"
      />
      <q-btn
        :label="t('general.helpAndFeedback')"
        class="feedbackButton"
        color="secondary"
        no-wrap
        outline
        @click="openFeedbackDialog"
      />
    </k-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { Dialog, Screen } from "quasar";
import { computed, provide } from "vue";
import { useI18n } from "vue-i18n";
import { IsLayoutHeaderXsInjectionKey } from "src/composables/header-features/models";
import { provideHeaderBackButton } from "src/composables/header-features/use-header-back-button";
import { provideHeaderFilters } from "src/composables/header-features/use-header-filters";
import { provideHeaderName } from "src/composables/header-features/use-header-name-button";
import { provideHeaderSearch } from "src/composables/header-features/use-header-search";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { useTheme } from "src/composables/use-theme";
import { useAuthService } from "src/services/auth";
import FeedbackDialog from "./feedback-dialog.vue";
import kToolbar from "./k-toolbar.vue";
import userItem from "./user-item.vue";

const { isDrawerOpen, showLateralDrawer } = useLateralDrawer();
const { isHeaderSearchEnabled, searchText } = provideHeaderSearch();
const { headerBackButtonRouteLocation } = provideHeaderBackButton();
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

function openFeedbackDialog() {
  Dialog.create({
    component: FeedbackDialog,
  });
}
</script>

<style scoped lang="scss">
$header-height: 64px;

.k-toolbar {
  height: $header-height;
}
</style>
