<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-form-card
      :title="t('sidebar.settings')"
      actions-padding
      size="fullscreen"
      @submit="validateSettings()"
    >
      <q-card-section
        class="column gap-4 no-wrap q-pb-xs q-pt-lg q-px-lg width-700"
      >
        <q-input
          v-model.number="newSettings.buyRate"
          :label="t('general.settings.purchaseRate')"
          bottom-slots
          outlined
          suffix="%"
          type="number"
        />
        <q-input
          v-model.number="newSettings.sellRate"
          :label="t('general.settings.saleRate')"
          bottom-slots
          outlined
          suffix="%"
          type="number"
        />
        <q-input
          v-model.number="newSettings.maxBookingDays"
          :label="t('general.settings.reservationDays')"
          :rules="[allowOnlyIntegerNumbers, greaterThanZeroRule]"
          outlined
          type="number"
        />
        <q-input
          v-model.number="newSettings.warehouseMaxBlockSize"
          :label="t('general.settings.maxBooksDimension')"
          :rules="[allowOnlyIntegerNumbers, greaterThanZeroRule]"
          outlined
          type="number"
        />
        <span class="gap-16 items-center q-pb-sm q-pt-none q-px-none row">
          <q-checkbox v-model="newSettings.payOffEnabled" color="primary" />
          {{ t("general.settings.payOffEnabled") }}
        </span>
      </q-card-section>

      <template #card-actions="{ uniqueFormId }">
        <q-btn v-if="hasAdminRole" color="accent" @click="confirmReset()">
          <q-item-section>
            {{ t("general.settings.resetButton") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="mdiInformationOutline" color="white">
              <q-tooltip>
                {{ t("general.settings.resetToolTip") }}
              </q-tooltip>
            </q-icon>
          </q-item-section>
        </q-btn>

        <q-space />

        <q-btn :label="t('common.cancel')" flat @click="onDialogCancel()" />

        <q-btn
          :form="uniqueFormId"
          :label="t('common.save')"
          flat
          type="submit"
        />
      </template>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiInformationOutline } from "@quasar/extras/mdi-v7";
import { Dialog, useDialogPluginComponent } from "quasar";
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import KDialogFormCard from "src/components/k-dialog-form-card.vue";
import {
  allowOnlyIntegerNumbers,
  greaterThanZeroRule,
} from "src/helpers/rules";
import { SettingsUpdate } from "src/models/book";
import { useAuthService } from "src/services/auth";
import { RetailLocationSettingsFragment } from "src/services/retail-location.graphql";

const props = defineProps<Omit<RetailLocationSettingsFragment, "__typename">>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent<SettingsUpdate>();

const { t } = useI18n();

const { hasAdminRole } = useAuthService();

const newSettings = reactive<RetailLocationSettingsFragment>({
  maxBookingDays: props.maxBookingDays,
  payOffEnabled: props.payOffEnabled,
  warehouseMaxBlockSize: props.warehouseMaxBlockSize,
  buyRate: props.buyRate,
  sellRate: props.sellRate,
});

function validateSettings() {
  const settingsUpdate = {
    type: "save" as const,
    settings: newSettings,
  };

  if (
    newSettings.buyRate !== props.buyRate ||
    newSettings.sellRate !== props.sellRate
  ) {
    Dialog.create({
      title: t("general.settings.updateRatesConfirmTitle"),
      message: t("general.settings.updateRatesConfirmMessage"),
      ok: t("actions.update"),
      cancel: t("common.cancel"),
    }).onOk(() => {
      onDialogOK(settingsUpdate);
    });
  } else {
    onDialogOK(settingsUpdate);
  }
}

function confirmReset() {
  Dialog.create({
    title: t("general.settings.resetButton"),
    message: t("general.settings.resetMessage"),
    cancel: true,
    ok: t("general.settings.resetConfirmButton"),
  }).onOk(() => {
    onDialogOK({ type: "reset" });
  });
}
</script>
