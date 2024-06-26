<template>
  <q-layout view="lHh LpR fFf">
    <q-drawer
      v-if="showLateralDrawer"
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
      <div v-if="!isMobile" class="full-width q-pa-md">
        <q-img :src="theme.logo" />
      </div>

      <q-scroll-area class="col-grow">
        <q-list class="drawer-list" separator>
          <q-item v-if="user" class="q-py-md">
            <q-item-section side>
              <q-icon :name="mdiAccountCircle" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="column">
                <span class="text-body1 text-weight-medium">
                  {{ `${user.firstname} ${user.lastname}` }}
                </span>
                <span
                  class="ellipsis full-width line-height-50 text-black-54 text-subtitle2 text-weight-regular"
                >
                  {{ user.email }}
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <div class="no-padding q-item q-item-type row">
            <q-item
              v-ripple
              :to="{ name: AvailableRouteNames.MyData }"
              active-class="bg-black-activated-light"
              class="drawer-item"
              clickable
              data-cy="my-data"
            >
              <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                {{ t("general.myData") }}
              </q-tooltip>
              <q-item-section side>
                <q-icon :name="mdiBadgeAccountHorizontal" color="black-54" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis text-size-16">
                  {{ t("general.myData") }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <template v-if="user && hasUserRole">
            <div class="no-padding q-item q-item-type row">
              <q-item
                v-ripple
                active-class="bg-black-activated-light"
                class="drawer-item"
                clickable
                :to="{ name: AvailableRouteNames.Home }"
                data-cy="home"
              >
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t("general.home") }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiHome" color="black-54" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis text-size-16">
                    {{ t("general.home") }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="no-padding q-item q-item-type row">
              <q-item
                v-ripple
                :to="{ name: AvailableRouteNames.ReserveBooks }"
                active-class="bg-black-activated-light"
                class="drawer-item"
                clickable
                data-cy="reserve-books"
              >
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t("general.reserveBooks") }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiBookOpenBlankVariant" color="black-54" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis text-size-16">
                    {{ t("general.reserveBooks") }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="mdiInformationOutline" color="black-54">
                    <q-tooltip>
                      {{ t("general.tooltips.reserveBooks") }}
                    </q-tooltip>
                  </q-icon>
                </q-item-section>
              </q-item>
            </div>

            <div class="no-padding q-item q-item-type row">
              <q-item
                v-ripple
                :to="{ name: AvailableRouteNames.MyBooks }"
                active-class="bg-black-activated-light"
                class="drawer-item"
                clickable
                data-cy="my-books"
              >
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t("general.myBooks") }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiCheckDecagram" color="black-54" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis text-size-16">
                    {{ t("general.myBooks") }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="mdiInformationOutline" color="black-54">
                    <q-tooltip>
                      {{ t("general.tooltips.myBooks") }}
                    </q-tooltip>
                  </q-icon>
                </q-item-section>
              </q-item>
            </div>

            <div class="no-padding q-item q-item-type row">
              <q-item
                v-ripple
                :to="{ name: AvailableRouteNames.SalableBooks }"
                active-class="bg-black-activated-light"
                class="drawer-item"
                clickable
                data-cy="salable-books"
              >
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t("general.salableBooks") }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiCurrencyEur" color="black-54" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis text-size-16">
                    {{ t("general.salableBooks") }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="mdiInformationOutline" color="black-54">
                    <q-tooltip>
                      {{ t("general.tooltips.salableBooks") }}
                    </q-tooltip>
                  </q-icon>
                </q-item-section>
              </q-item>
            </div>

            <div class="no-padding q-item q-item-type row">
              <q-item
                v-ripple
                :to="{ name: AvailableRouteNames.FAQ }"
                active-class="bg-black-activated-light"
                class="drawer-item"
                clickable
                data-cy="faq"
              >
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t("general.faq") }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiHelpCircle" color="black-54" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis text-size-16">
                    {{ t("general.faq") }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </template>

          <template v-if="user && (hasAdminRole || hasOperatorRole)">
            <div class="no-padding q-item q-item-type row">
              <q-item
                v-ripple
                :to="{ name: AvailableRouteNames.Warehouse }"
                active-class="bg-black-activated-light"
                class="drawer-item"
                clickable
                data-cy="warehouse"
              >
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t("general.tooltips.warehouse") }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiBookshelf" color="black-54" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis text-size-16">
                    {{ t("general.warehouse") }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="mdiInformationOutline" color="black-54">
                    <q-tooltip>
                      {{ t("general.tooltips.warehouse") }}
                    </q-tooltip>
                  </q-icon>
                </q-item-section>
              </q-item>
            </div>

            <div class="no-padding q-item q-item-type row">
              <q-item
                v-ripple
                :to="{ name: AvailableRouteNames.Catalog }"
                active-class="bg-black-activated-light"
                class="drawer-item"
                clickable
                data-cy="books-catalog"
              >
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t(`routesNames.${AvailableRouteNames.Catalog}`) }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiBookOpenBlankVariant" color="black-54" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis text-size-16">
                    {{ t("routesNames.catalog") }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="mdiInformationOutline" color="black-54">
                    <q-tooltip>
                      {{ t("general.tooltips.catalog") }}
                    </q-tooltip>
                  </q-icon>
                </q-item-section>
              </q-item>
            </div>

            <div class="no-padding q-item q-item-type row">
              <q-item
                v-ripple
                :to="{ name: AvailableRouteNames.UsersManagement }"
                active-class="bg-black-activated-light"
                class="drawer-item"
                clickable
                data-cy="users-management"
              >
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t(`routesNames.${AvailableRouteNames.UsersManagement}`) }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiAccountMultiple" color="black-54" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis text-size-16">
                    {{
                      t(`routesNames.${AvailableRouteNames.UsersManagement}`)
                    }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="mdiInformationOutline" color="black-54">
                    <q-tooltip>
                      {{ t("general.tooltips.usersAndMovements") }}
                    </q-tooltip>
                  </q-icon>
                </q-item-section>
              </q-item>
            </div>

            <template v-if="hasAdminRole">
              <div class="no-padding q-item q-item-type row">
                <q-item
                  v-ripple
                  active-class="bg-black-activated-light"
                  class="drawer-item"
                  clickable
                  @click="openSettings()"
                >
                  <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                    {{ t(`sidebar.settings`) }}
                  </q-tooltip>
                  <q-item-section side>
                    <q-icon :name="mdiCog" color="black-54" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="ellipsis text-size-16">
                      {{ t("sidebar.settings") }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>

              <div class="no-padding q-item q-item-type row">
                <q-item
                  v-ripple
                  :to="{ name: AvailableRouteNames.RolesAndPermissions }"
                  active-class="bg-black-activated-light"
                  class="drawer-item"
                  clickable
                  data-cy="roles-and-permissions"
                >
                  <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                    {{
                      t(
                        `routesNames.${AvailableRouteNames.RolesAndPermissions}`,
                      )
                    }}
                  </q-tooltip>
                  <q-item-section side>
                    <q-icon :name="mdiKey" color="black-54" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="ellipsis text-size-16">
                      {{
                        t(
                          `routesNames.${AvailableRouteNames.RolesAndPermissions}`,
                        )
                      }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>

              <div class="no-padding q-item q-item-type row">
                <q-item
                  v-ripple
                  :to="{ name: AvailableRouteNames.Statistics }"
                  active-class="bg-black-activated-light"
                  class="drawer-item"
                  clickable
                >
                  <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                    {{ t(`routesNames.${AvailableRouteNames.Statistics}`) }}
                  </q-tooltip>
                  <q-item-section side>
                    <q-icon :name="mdiChartLine" color="black-54" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="ellipsis text-size-16">
                      {{ t(`routesNames.${AvailableRouteNames.Statistics}`) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </template>
          </template>

          <div class="no-padding q-item q-item-type row">
            <q-expansion-item :expand-icon="mdiMenuDown" class="drawer-item">
              <template #header>
                <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                  {{ t("general.language") }}
                </q-tooltip>
                <q-item-section side>
                  <q-icon :name="mdiWeb" color="black-54" />
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
                  :class="
                    locale === language.code ? 'bg-black-activated-light' : ''
                  "
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
          </div>

          <div class="no-padding q-item q-item-type row">
            <q-item
              v-ripple
              class="drawer-item"
              clickable
              data-cy="logout-button"
              @click="logout"
            >
              <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                {{ t("auth.logOut") }}
              </q-tooltip>
              <q-item-section side>
                <q-icon :name="mdiExitToApp" color="black-54" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis text-size-16">
                  {{ t("auth.logOut") }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="layout-background">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {
  mdiAccountCircle,
  mdiAccountMultiple,
  mdiBadgeAccountHorizontal,
  mdiBookOpenBlankVariant,
  mdiBookshelf,
  mdiChartLine,
  mdiCheckDecagram,
  mdiCloudCheckOutline,
  mdiCloudOffOutline,
  mdiCog,
  mdiCurrencyEur,
  mdiExitToApp,
  mdiHelpCircle,
  mdiHome,
  mdiInformationOutline,
  mdiKey,
  mdiMenuDown,
  mdiWeb,
} from "@quasar/extras/mdi-v7";
import { useOnline } from "@vueuse/core";
import { Dialog, Notify, QTooltipProps, Screen } from "quasar";
import { computed, provide, watch } from "vue";
import { useI18n } from "vue-i18n";
import { setLanguage } from "src/boot/i18n";
import SettingsDialog from "src/components/settings-dialog.vue";
import { IsLayoutHeaderXsInjectionKey } from "src/composables/header-features/models";
import {
  DRAWER_BREAKPOINT,
  DRAWER_WIDTH,
  useLateralDrawer,
} from "src/composables/use-lateral-drawer";
import { useTheme } from "src/composables/use-theme";
import { notifyError } from "src/helpers/error-messages";
import { SettingsUpdate } from "src/models/book";
import { languages } from "src/models/language";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService, useLogoutMutation } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";
import {
  RetailLocationFragmentDoc,
  RetailLocationSettingsFragment,
  useResetRetailLocationMutation,
  useUpdateRetailLocationSettingsMutation,
} from "src/services/retail-location.graphql";

// It would work with :inset-level="1" if we used "avatar" option instead of "side" for the header icon
// but we only need 16px of margin from the icon, so we defined a value which would align the text accordingly
const EXPANSION_ITEMS_INSET_LEVEL = 0.73;

const TOOLTIP_SHARED_PROPS: QTooltipProps = {
  offset: [10, 20],
  anchor: "center right",
  self: "center left",
};

const { t, locale } = useI18n();

const { theme } = useTheme();

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

const { logout } = useLogoutMutation();
const { user, hasAdminRole, hasOperatorRole, hasUserRole } = useAuthService();

const { isDrawerMini, isDrawerOpen, showLateralDrawer, isMobile } =
  useLateralDrawer();

const { selectedLocation } = useRetailLocationService();

const { updateRetailLocationSettings } =
  useUpdateRetailLocationSettingsMutation();
const { resetRetailLocation } = useResetRetailLocationMutation();
function openSettings() {
  Dialog.create({
    component: SettingsDialog,
    componentProps: {
      warehouseMaxBlockSize: selectedLocation.value.warehouseMaxBlockSize,
      buyRate: selectedLocation.value.buyRate,
      maxBookingDays: selectedLocation.value.maxBookingDays,
      sellRate: selectedLocation.value.sellRate,
      registrationEnabled: selectedLocation.value.registrationEnabled,
      payOffEnabled: selectedLocation.value.payOffEnabled,
    } satisfies RetailLocationSettingsFragment,
  }).onOk(async (payload: SettingsUpdate) => {
    if (payload.type === "save") {
      try {
        const { cache } = await updateRetailLocationSettings({
          input: {
            ...payload.settings,
            retailLocationId: selectedLocation.value.id,
          },
        });

        cache.updateFragment(
          {
            fragment: RetailLocationFragmentDoc,
            fragmentName: "RetailLocation",
            id: cache.identify(selectedLocation.value),
          },
          (data) => {
            if (!data) {
              return;
            }

            return {
              ...data,
              ...payload.settings,
            };
          },
        );
      } catch {
        notifyError(t("common.genericErrorMessage"));
      }
    } else {
      await resetRetailLocation({
        input: {
          retailLocationId: selectedLocation.value.id,
        },
      });
      window.location.reload();
    }
  });
}
</script>

<style lang="scss" scoped>
.drawer-list {
  // QScrollArea both handles x andd y overflow but since we want the drawer to have a fixed width
  // and using ellipses to truncate words we need to force that width to the content container too
  // Do not use just "width" otherwise you'l break "mini" mode
  max-width: calc(v-bind(DRAWER_WIDTH) * 1px);
  width: 100%;
}

.drawer-item {
  border-radius: 4px;
  margin: 2px;
  max-width: calc(
    v-bind(DRAWER_WIDTH) * 1px - 4px
  ); // Subtracting the 2px of margin on both left and right

  width: 100%;
}

.q-btn--outline::before {
  color: rgba(#fff, 0.12);
}
</style>
