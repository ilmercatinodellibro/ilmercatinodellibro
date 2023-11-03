<template>
  <q-toolbar class="bg-primary k-toolbar q-px-md text-white">
    <template v-if="isMobile && enableDrawer">
      <q-btn
        v-if="backRouteLocation !== undefined"
        :icon="mdiArrowLeft"
        dense
        flat
        round
        :to="backRouteLocation"
      />
      <q-btn
        v-else
        :icon="mdiMenu"
        dense
        flat
        round
        aria-controls="page-drawer"
        :aria-expanded="drawerProxy ? 'true' : 'false'"
        data-cy="drawer-button"
        @click="drawerProxy = !drawerProxy"
      />
    </template>
    <template v-else>
      <slot name="left" />
    </template>

    <q-toolbar-title
      v-if="!showHeaderFilters"
      class="font-weight-500 q-px-none text-size-20"
    >
      {{ title }}
    </q-toolbar-title>

    <template v-if="$q.screen.lt.sm">
      <header-filters
        v-if="
          !showHeaderFilters &&
          filterOptions &&
          filterOptions.length > 0 &&
          isHeaderFiltersEnabled
        "
        v-model="selectedFilterProxy"
        :compare-function="compareFunction"
        :filter-options="filterOptions"
      />
      <header-search-bar
        v-if="showSearchBar"
        v-model="searchTextProxy"
        @search-bar-active-state-toggled="updateSearchBarActiveState"
      />
    </template>

    <slot />
  </q-toolbar>
</template>

<script setup lang="ts" generic="TFilterOptionValue = any">
import { mdiArrowLeft, mdiMenu } from "@quasar/extras/mdi-v7";
import { QSelectOption } from "quasar";
import { ref } from "vue";
import { RouteLocationRaw } from "vue-router";
import HeaderFilters from "src/components/header-filters.vue";
import HeaderSearchBar from "src/components/header-search-bar.vue";
import { HeaderFilterModel } from "src/composables/header-features/use-header-filters";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";

defineProps<{
  title?: string;
  enableDrawer?: boolean;
  backRouteLocation?: RouteLocationRaw;
  showSearchBar?: boolean;

  filterOptions?: QSelectOption<TFilterOptionValue>[];
  isHeaderFiltersEnabled?: boolean;
  compareFunction?: (
    opt1: TFilterOptionValue,
    opt2: TFilterOptionValue,
  ) => boolean;
}>();

const selectedFilterProxy =
  defineModel<HeaderFilterModel<TFilterOptionValue>>("selectedFilter");

const searchTextProxy = defineModel<string>("searchText", { default: "" });

const drawerProxy = defineModel<boolean>("drawer");

const showHeaderFilters = ref(false);

function updateSearchBarActiveState(newState: boolean) {
  showHeaderFilters.value = newState;
}

const { isMobile } = useLateralDrawer();
</script>

<style scoped lang="scss">
.k-toolbar {
  // Keeps toolbar height consistent while toggling the search bar
  min-height: 56px;
}
</style>
