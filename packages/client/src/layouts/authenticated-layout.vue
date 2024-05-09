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
          <template v-if="user && hasUserRole">
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
                <q-icon :name="mdiAccountCircle" color="black-54" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis text-size-16">
                  {{ t("general.myData") }}
                </q-item-label>
              </q-item-section>
            </q-item>

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
          </template>

          <template v-if="user && (hasAdminRole || hasOperatorRole)">
            <q-item class="q-pr-sm q-py-md">
              <q-item-section side>
                <q-icon :name="mdiAccountCircle" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="column">
                  <span class="text-body1 text-weight-medium">
                    {{ `${user.firstname} ${user.lastname}` }}
                  </span>
                  <span
                    class="line-height-50 text-black-54 text-subtitle2 text-weight-regular"
                  >
                    {{ user.email }}
                  </span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  :icon="mdiPencil"
                  color="black-54"
                  flat
                  round
                  @click="editCurrentUserData()"
                />
              </q-item-section>
            </q-item>

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
                  {{ t(`routesNames.${AvailableRouteNames.UsersManagement}`) }}
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

            <q-item
              v-if="hasAdminRole"
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

            <q-item
              v-if="hasAdminRole"
              v-ripple
              :to="{ name: AvailableRouteNames.RolesAndPermissions }"
              active-class="bg-black-activated-light"
              class="drawer-item"
              clickable
              data-cy="roles-and-permissions"
            >
              <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
                {{
                  t(`routesNames.${AvailableRouteNames.RolesAndPermissions}`)
                }}
              </q-tooltip>
              <q-item-section side>
                <q-icon :name="mdiKey" color="black-54" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis text-size-16">
                  {{
                    t(`routesNames.${AvailableRouteNames.RolesAndPermissions}`)
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>

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
  mdiBookOpenBlankVariant,
  mdiBookshelf,
  mdiCheckDecagram,
  mdiCloudCheckOutline,
  mdiCloudOffOutline,
  mdiCog,
  mdiCurrencyEur,
  mdiExitToApp,
  mdiHome,
  mdiInformationOutline,
  mdiKey,
  mdiMenuDown,
  mdiPencil,
  mdiWeb,
} from "@quasar/extras/mdi-v7";
import { useOnline } from "@vueuse/core";
import { Dialog, Notify, QTooltipProps, Screen } from "quasar";
import { computed, provide, watch } from "vue";
import { useI18n } from "vue-i18n";
import { UpdateUserPayload } from "src/@generated/graphql";
import { setLanguage } from "src/boot/i18n";
import EditUserDataDialog from "src/components/edit-user-data-dialog.vue";
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
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService, useLogoutMutation } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";
import {
  UserFragmentDoc,
  useUpdateUserMutation,
} from "src/services/user.graphql";

// It would work with :inset-level="1" if we used "avatar" option instead of "side" for the header icon
// but we only need 16px of margin from the icon, so we defined a value which would align the text accordingly
const EXPANSION_ITEMS_INSET_LEVEL = 0.73;

const TOOLTIP_SHARED_PROPS: QTooltipProps = {
  offset: [10, 20],
  anchor: "center right",
  self: "center left",
};

const { t, locale } = useI18n();

interface Language {
  code: string;
  label: string;
}

const { theme } = useTheme();

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

const { logout } = useLogoutMutation();
const { user, hasAdminRole, hasOperatorRole, hasUserRole, updateCurrentUser } =
  useAuthService();

const { isDrawerMini, isDrawerOpen, showLateralDrawer, isMobile } =
  useLateralDrawer();

const { selectedLocation } = useRetailLocationService();

function openSettings() {
  Dialog.create({
    component: SettingsDialog,
    componentProps: {
      maxBooksDimensionCurrent: selectedLocation.value.warehouseMaxBlockSize,
      purchaseRateCurrent: selectedLocation.value.buyRate,
      reservationDaysCurrent: selectedLocation.value.maxBookingDays,
      saleRateCurrent: selectedLocation.value.sellRate,
    },
  }).onOk((payload: SettingsUpdate) => {
    if (payload.type === "save") {
      // FIXME: update the settings
    } else {
      // FIXME: reset the settings
    }
  });
}

const { updateUser } = useUpdateUserMutation();
function editCurrentUserData() {
  Dialog.create({
    component: EditUserDataDialog,
  }).onOk(async (newUserData: UpdateUserPayload) => {
    if (!user.value) {
      return;
    }

    try {
      const { cache } = await updateUser({
        input: {
          ...newUserData,
          email:
            newUserData.email && newUserData.email !== user.value.email
              ? newUserData.email
              : user.value.email,
          password: newUserData.password ? newUserData.password : undefined,
          id: user.value.id,
          retailLocationId: selectedLocation.value.id,
        },
      });

      cache.updateFragment(
        {
          fragment: UserFragmentDoc,
          fragmentName: "UserSummary",
          id: cache.identify(user.value),
        },
        (data) => {
          if (!data || !user.value) {
            return;
          }
          return {
            ...data,
            ...newUserData,
            email:
              newUserData.email && newUserData.email !== user.value.email
                ? newUserData.email
                : user.value.email,
            password: newUserData.password ? newUserData.password : undefined,
            discount: newUserData.discount ?? false,
          };
        },
      );

      updateCurrentUser(newUserData);
    } catch {
      notifyError(t("auth.couldNotUpdate"));
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
}

.drawer-item {
  border-radius: 4px;
  margin: 2px;
}

.q-btn--outline::before {
  color: rgba(#fff, 0.12);
}

.q-item__label--header {
  padding: {
    top: 24px;
    bottom: 8px;
  }
}
</style>
