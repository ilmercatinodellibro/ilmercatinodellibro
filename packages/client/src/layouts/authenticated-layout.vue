<template>
  <q-layout view="lHh LpR fFf">
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
          <img :src="theme.logo" class="header-logo" />
          <q-separator vertical inset color="white-12" class="q-mx-md" />
        </template>

        <div v-if="!isOnline" class="flex gap-6 items-center">
          <q-icon :name="mdiCloudOffOutline" size="sm" />

          <span>{{ t("network.offline") }}</span>
        </div>

        <notification-bell v-if="isWebPushEnabled" />

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

    <q-drawer
      v-if="showLateralDrawer"
      id="page-drawer"
      v-model="isDrawerOpen"
      :breakpoint="DRAWER_BREAKPOINT"
      :mini="isDrawerMini"
      :width="DRAWER_WIDTH"
      class="column height-0"
      content-class="bg-grey-1"
      show-if-above
      role="navigation"
      data-cy="page-drawer"
      :aria-label="t('general.mainNavigation')"
    >
      <div
        v-if="!isMobile"
        :class="isDrawerMini ? 'justify-center' : 'justify-end'"
        class="bg-black drawer-toggler items-center q-pa-xs row"
      >
        <q-btn
          :icon="isDrawerMini ? mdiChevronRight : mdiChevronLeft"
          color="white"
          flat
          round
          @click="isDrawerMini = !isDrawerMini"
        />
      </div>

      <q-scroll-area class="col-grow">
        <q-list class="drawer-list">
          <!-- [1] -->
          <user-item
            v-if="user && isLayoutHeaderXs"
            :user="user"
            data-cy="user-item"
          />

          <q-item
            :to="{ name: AvailableRouteNames.Events }"
            active-class="bg-primary-activated-light"
          >
            <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
              {{ $t(`routesNames.${AvailableRouteNames.Events}`) }}
            </q-tooltip>
            <q-item-section side>
              <q-icon :name="mdiAlarmLight" color="secondary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="ellipsis text-size-16">
                {{ $t(`routesNames.${AvailableRouteNames.Events}`) }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="unreadNotificationsCount > 0" side>
              <q-avatar color="negative" text-color="white" size="sm">
                {{ unreadNotificationsCount }}
              </q-avatar>
            </q-item-section>
          </q-item>

          <template v-if="user?.role === 'ADMIN'">
            <q-separator class="q-mb-sm" />

            <q-item-label class="text-size-12" header>
              {{ t("sidebar.settings") }}
            </q-item-label>

            <q-item
              :to="{ name: AvailableRouteNames.Theme }"
              active-class="bg-primary-activated-light"
            >
              <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                {{ t(`routesNames.${AvailableRouteNames.Theme}`) }}
              </q-tooltip>
              <q-item-section side>
                <q-icon :name="mdiPaletteSwatch" color="secondary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis text-size-16">
                  {{ t(`routesNames.${AvailableRouteNames.Theme}`) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              :to="{ name: AvailableRouteNames.RolesAndPermissions }"
              active-class="bg-primary-activated-light"
            >
              <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                {{
                  t(`routesNames.${AvailableRouteNames.RolesAndPermissions}`)
                }}
              </q-tooltip>
              <q-item-section side>
                <q-icon :name="mdiAccountMultiple" color="secondary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis text-size-16">
                  {{
                    t(`routesNames.${AvailableRouteNames.RolesAndPermissions}`)
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />
          </template>

          <q-expansion-item
            :expand-icon="mdiMenuDown"
            :expanded-icon="mdiMenuUp"
          >
            <template #header>
              <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                {{ t("general.language") }}
              </q-tooltip>
              <q-item-section side>
                <q-icon :name="mdiWeb" color="secondary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis text-size-16">
                  {{ t("general.language") }}
                </q-item-label>
              </q-item-section>
            </template>

            <q-list>
              <q-item
                v-for="language in languages"
                :key="language.code"
                clickable
                :class="locale === language.code ? 'selected' : ''"
                :inset-level="EXPANSION_ITEMS_INSET_LEVEL"
                @click="setLanguage(language.code)"
              >
                <q-item-section>
                  <q-item-label class="ellipsis text-size-14">
                    {{ language.label }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <q-item v-ripple clickable data-cy="logout-button" @click="logout">
            <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
              {{ t("auth.logOut") }}
            </q-tooltip>
            <q-item-section side>
              <q-icon :name="mdiExitToApp" color="secondary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="ellipsis text-size-16">
                {{ t("auth.logOut") }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {
  mdiAccountMultiple,
  mdiAlarmLight,
  mdiChevronLeft,
  mdiChevronRight,
  mdiCloudCheckOutline,
  mdiCloudOffOutline,
  mdiExitToApp,
  mdiMenuDown,
  mdiMenuUp,
  mdiPaletteSwatch,
  mdiWeb,
} from "@quasar/extras/mdi-v7";
import { useOnline } from "@vueuse/core";
import { Dialog, Notify, QTooltipProps, Screen } from "quasar";
import { computed, provide, watch } from "vue";
import { useI18n } from "vue-i18n";
import { setLanguage } from "src/boot/i18n";
import FeedbackDialog from "src/components/feedback-dialog.vue";
import KToolbar from "src/components/k-toolbar.vue";
import NotificationBell from "src/components/notification-bell.vue";
import UserItem from "src/components/user-item.vue";
import { IsLayoutHeaderXsInjectionKey } from "src/composables/header-features/models";
import { provideHeaderBackButton } from "src/composables/header-features/use-header-back-button";
import { provideHeaderFilters } from "src/composables/header-features/use-header-filters";
import { provideHeaderName } from "src/composables/header-features/use-header-name-button";
import { provideHeaderSearch } from "src/composables/header-features/use-header-search";
import {
  DRAWER_BREAKPOINT,
  DRAWER_WIDTH,
  useLateralDrawer,
} from "src/composables/use-lateral-drawer";
import { useTheme } from "src/composables/use-theme";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService, useLogoutMutation } from "src/services/auth";
import { useNotificationService } from "src/services/notification";

// It would work with :inset-level="1" if we used "avatar" option instead of "side" for the header icon
// but we only need 16px of margin from the icon, so we defined a value which would align the text accordingly
const EXPANSION_ITEMS_INSET_LEVEL = 0.73;

const TOOLTIP_SHARED_PROPS: QTooltipProps = {
  offset: [10, 20],
  anchor: "center right",
  self: "center left",
};

const isWebPushEnabled = process.env.WEB_PUSH_ENABLED === "true";

const { t, locale } = useI18n();

const { theme } = useTheme();

interface Language {
  code: string;
  label: string;
}

const languages = [
  {
    code: "en-US" as const,
    label: "English",
  },
  {
    code: "it" as const,
    label: "Italiano",
  },
] satisfies Language[];

const isOnline = useOnline();
watch(isOnline, (becomeOnline) => {
  if (becomeOnline) {
    Notify.create({
      type: "info",
      message: t("network.becomeOnline"),
      icon: mdiCloudCheckOutline,
      group: "network",
    });
  } else {
    Notify.create({
      type: "warning",
      message: t("network.becomeOffline"),
      icon: mdiCloudOffOutline,
      group: "network",
    });
  }
});
const isLayoutHeaderXs = computed(() => Screen.lt.sm);

provide(IsLayoutHeaderXsInjectionKey, isLayoutHeaderXs);

const { isHeaderSearchEnabled, searchText } = provideHeaderSearch();
const {
  compareFunction,
  filterOptions,
  isHeaderFiltersEnabled,
  selectedFilter,
} = provideHeaderFilters();
const { headerBackButtonRouteLocation } = provideHeaderBackButton();
const { headerName } = provideHeaderName();

const { logout } = useLogoutMutation();
const { user } = useAuthService();

const { isDrawerMini, isDrawerOpen, showLateralDrawer, isMobile } =
  useLateralDrawer();

const { unreadNotificationsCount } = useNotificationService();

function openFeedbackDialog() {
  Dialog.create({
    component: FeedbackDialog,
  });
}
</script>

<style lang="scss" scoped>
$header-height: 64px;

.drawer-list {
  // QScrollArea both handles x andd y overflow but since we want the drawer to have a fixed width
  // and using ellipses to truncate words we need to force that width to the content container too
  // Do not use just "width" otherwise you'l break "mini" mode
  max-width: calc(v-bind(DRAWER_WIDTH) * 1px);
}

.selected {
  background-color: rgba(#000, 0.1);
}

.header-logo {
  height: 36px;
}

.k-toolbar,
.drawer-toggler {
  height: $header-height;
}

.q-btn--outline::before {
  color: rgba(#fff, 0.12);
}

// I had to force the height that way since the "dense" property makes them too small
.custom-dense-drawer-element {
  height: 36px;
  min-height: 36px;
}

.q-item__label--header {
  padding: {
    top: 24px;
    bottom: 8px;
  }
}
</style>
