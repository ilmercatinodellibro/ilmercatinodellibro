<template>
  <q-drawer
    id="page-drawer"
    v-model="isDrawerOpen"
    :breakpoint="DRAWER_BREAKPOINT"
    :mini="isDrawerMini"
    :width="DRAWER_WIDTH"
    class="column flex-delegate-height-management"
    content-class="bg-grey-1"
    show-if-above
    role="navigation"
    bordered
    data-cy="page-drawer"
    :aria-label="t('general.mainNavigation')"
  >
    <q-icon
      v-if="isMobile"
      :name="mdiClose"
      class="q-pa-sm self-end"
      size="sm"
      @click="isDrawerOpen = false"
    />

    <div class="q-pa-md">
      <q-img fit="scale-down" height="60px" :src="theme.logo" />
    </div>

    <q-scroll-area class="col-grow">
      <q-list class="drawer-list">
        <slot />
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { mdiClose } from "@quasar/extras/mdi-v7";
import { useI18n } from "vue-i18n";
import {
  DRAWER_BREAKPOINT,
  DRAWER_WIDTH,
  useLateralDrawer,
} from "src/composables/use-lateral-drawer";
import { useTheme } from "src/composables/use-theme";

const { t } = useI18n();

const { isDrawerMini, isDrawerOpen, isMobile } = useLateralDrawer();

const { theme } = useTheme();
</script>

<style scoped lang="scss">
.drawer-list {
  // QScrollArea both handles x and y overflow but since we want the drawer to have a fixed width
  // and using ellipses to truncate words we need to force that width to the content container too
  // Do not use just "width" otherwise you'l break "mini" mode
  max-width: calc(v-bind(DRAWER_WIDTH) * 1px);
  width: 100%;

  :deep(.q-item) {
    border-radius: 4px;
    margin: 2px;
    max-width: calc(
      v-bind(DRAWER_WIDTH) * 1px - 4px
    ); // Subtracting the 2px of margin on both left and right

    width: 100%;
  }
}
</style>
