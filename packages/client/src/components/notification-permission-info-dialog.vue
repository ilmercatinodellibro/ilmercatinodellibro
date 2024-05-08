<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :cancel-label="t('pushNotifications.permissionDialog.later')"
      :save-label="t('pushNotifications.permissionDialog.allow')"
      :title="t('pushNotifications.permissionDialog.title')"
      show-save-button
      size="sm"
      @cancel="onDialogCancel()"
      @save="onDialogOK()"
    >
      <q-card-section class="gap-4">
        {{ t("pushNotifications.permissionDialog.message") }}

        <q-space />

        <q-img
          :src="getImagePath($q.lang.isoName)"
          :alt="
            t(`pushNotifications.permissionDialog.imageAlt.${activeBrowser}`)
          "
        >
          <template #error>
            <!-- Fall back to English if the image for the current language is not available -->
            <q-img
              :src="getImagePath('en-US')"
              :alt="
                t(
                  `pushNotifications.permissionDialog.imageAlt.${activeBrowser}`,
                )
              "
            >
              <!-- If the image for English is not available either, show an error message -->
              <template #error>
                <div class="fit flex flex-center">
                  <q-icon :name="mdiImageOffOutline" size="lg" />
                  {{ t("pushNotifications.permissionDialog.imageError") }}
                </div>
              </template>
            </q-img>
          </template>
        </q-img>
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiImageOffOutline } from "@quasar/extras/mdi-v7";
import { Platform, useDialogPluginComponent } from "quasar";
import { useI18n } from "vue-i18n";
import KDialogCard from "./k-dialog-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

const { t } = useI18n();

const activePlatform = Platform.is.mobile ? "mobile" : "desktop";
const activeBrowser = Platform.is.firefox
  ? "firefox"
  : Platform.is.safari
  ? // TODO: Add a mobile Safari image
    "safari"
  : "chromium";

const getImagePath = (language: string) =>
  `/push-notification/${language}/browser-popup-${activePlatform}-${activeBrowser}.jpg`;
</script>
