<template>
  <q-layout view="lHh LpR fFf">
    <header-bar v-if="isMobile" />

    <app-drawer>
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

      <q-separator />

      <q-item
        v-ripple
        :to="{ name: AvailableRouteNames.MyData }"
        active-class="bg-black-activated-light"
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

      <template v-if="user && hasUserRole">
        <q-separator />

        <q-item
          v-ripple
          active-class="bg-black-activated-light"
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

        <q-separator />

        <q-item
          v-ripple
          :to="{ name: AvailableRouteNames.ReserveBooks }"
          active-class="bg-black-activated-light"
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

        <q-separator />

        <q-item
          v-ripple
          :to="{ name: AvailableRouteNames.MyBooks }"
          active-class="bg-black-activated-light"
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

        <q-separator />

        <q-item
          v-ripple
          :to="{ name: AvailableRouteNames.SalableBooks }"
          active-class="bg-black-activated-light"
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

        <template v-if="isMobile">
          <q-separator />

          <q-item
            v-ripple
            :to="{ name: AvailableRouteNames.FAQ }"
            active-class="bg-black-activated-light"
            clickable
            data-cy="faq"
          >
            <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
              {{ t("general.faq") }}
            </q-tooltip>
            <q-item-section side>
              <q-icon :name="mdiFrequentlyAskedQuestions" color="black-54" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="ellipsis text-size-16">
                {{ t("general.faq") }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item
            v-ripple
            clickable
            :to="{ name: AvailableRouteNames.Contacts }"
          >
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

          <q-item
            v-ripple
            clickable
            :to="{ name: AvailableRouteNames.WhoWeAre }"
          >
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
        </template>
      </template>

      <template v-if="user && (hasAdminRole || hasOperatorRole)">
        <q-separator />

        <q-item
          v-ripple
          :to="{ name: AvailableRouteNames.UsersManagement }"
          active-class="bg-black-activated-light"
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

        <q-separator />

        <q-item
          v-ripple
          :to="{ name: AvailableRouteNames.Warehouse }"
          active-class="bg-black-activated-light"
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

        <q-separator />

        <q-item
          v-ripple
          :to="{ name: AvailableRouteNames.Catalog }"
          active-class="bg-black-activated-light"
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

        <template v-if="hasAdminRole">
          <q-separator />

          <q-item
            v-ripple
            active-class="bg-black-activated-light"
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

          <q-separator />

          <q-item
            v-ripple
            :to="{ name: AvailableRouteNames.RolesAndPermissions }"
            active-class="bg-black-activated-light"
            clickable
            data-cy="roles-and-permissions"
          >
            <q-tooltip v-if="isDrawerMini" v-bind="TOOLTIP_SHARED_PROPS">
              {{ t(`routesNames.${AvailableRouteNames.RolesAndPermissions}`) }}
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

          <q-separator />

          <q-item
            v-ripple
            :to="{ name: AvailableRouteNames.Statistics }"
            active-class="bg-black-activated-light"
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
        </template>
      </template>

      <q-separator />

      <q-expansion-item :expand-icon="mdiMenuDown">
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
            :class="locale === language.code ? 'bg-black-activated-light' : ''"
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

      <q-separator />

      <q-item v-ripple clickable data-cy="logout-button" @click="logout()">
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
    </app-drawer>

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
  mdiFrequentlyAskedQuestions,
  mdiHandshake,
  mdiHelpCircle,
  mdiHome,
  mdiInformationOutline,
  mdiKey,
  mdiMenuDown,
  mdiPhone,
  mdiWeb,
} from "@quasar/extras/mdi-v7";
import { useOnline } from "@vueuse/core";
import { Dialog, Notify, QTooltipProps } from "quasar";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { setLanguage } from "src/boot/i18n";
import AppDrawer from "src/components/app-drawer.vue";
import HeaderBar from "src/components/header-bar.vue";
import SettingsDialog from "src/components/settings-dialog.vue";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
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

const { logout: logoutMutation } = useLogoutMutation();
function logout() {
  isDrawerOpen.value = false;
  logoutMutation();
}
const { user, hasAdminRole, hasOperatorRole, hasUserRole } = useAuthService();
const { isDrawerMini, isDrawerOpen, isMobile } = useLateralDrawer();

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
