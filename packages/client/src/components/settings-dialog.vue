<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="t('sidebar.settings')"
      actions-padding
      size="fullscreen"
      @submit="
        onDialogOK({
          type: 'save',
          settings: newSettings,
        })
      "
    >
      <q-card-section
        class="column gap-4 no-wrap q-pb-xs q-pt-lg q-px-lg width-700"
      >
        <q-input
          v-model.number="purchaseRate"
          :placeholder="t('general.settings.purchaseRate')"
          bottom-slots
          outlined
          readonly
          suffix="%"
          type="number"
        />
        <q-input
          v-model.number="saleRate"
          :placeholder="t('general.settings.saleRate')"
          bottom-slots
          outlined
          readonly
          suffix="%"
          type="number"
        />
        <q-input
          v-model.number="newSettings.maxBookingDays"
          :placeholder="t('general.settings.reservationDays')"
          :rules="[allowOnlyIntegerNumbers, greaterThanZeroRule]"
          outlined
          type="number"
        />
        <q-input
          v-model.number="newSettings.warehouseMaxBlockSize"
          :placeholder="t('general.settings.maxBooksDimension')"
          :rules="[allowOnlyIntegerNumbers, greaterThanZeroRule]"
          outlined
          type="number"
        />
      </q-card-section>

      <template #card-actions="{ uniqueFormId }">
        <q-btn color="accent" @click="confirmReset()">
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
import { Settings, SettingsUpdate, SettingsUpdateInput } from "src/models/book";

const props = defineProps<Settings>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent<SettingsUpdate>();

const { t } = useI18n();

const newSettings = reactive<SettingsUpdateInput>({
  maxBookingDays: props.maxBookingDays,
  payOffEnabled: props.payOffEnabled,
  warehouseMaxBlockSize: props.warehouseMaxBlockSize,
});

const purchaseRate = props.buyRate;
const saleRate = props.sellRate;

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
