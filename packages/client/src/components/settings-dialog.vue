<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="t('sidebar.settings')"
      actions-padding
      size="fullscreen"
      @submit="
        onDialogOK({
          type: 'save',
          settings: {
            maxBooksDimension,
            purchaseRate,
            reservationDays,
            saleRate,
          },
        })
      "
    >
      <q-card-section
        class="column gap-4 no-wrap q-pb-xs q-pt-lg q-px-lg width-700"
      >
        <q-input
          v-model="purchaseRate"
          :placeholder="t('general.settings.purchaseRate')"
          :rules="[numberBetween(0, 100)]"
          type="number"
          outlined
          suffix="%"
        />
        <q-input
          v-model="saleRate"
          :placeholder="t('general.settings.saleRate')"
          :rules="[numberBetween(0, 100)]"
          type="number"
          outlined
          suffix="%"
        />
        <q-input
          v-model="reservationDays"
          :placeholder="t('general.settings.reservationDays')"
          :rules="[allowOnlyIntegerNumbers, greaterThanZeroRule]"
          type="number"
          outlined
        />
        <q-input
          v-model="maxBooksDimension"
          :placeholder="t('general.settings.maxBooksDimension')"
          :rules="[allowOnlyIntegerNumbers, greaterThanZeroRule]"
          type="number"
          outlined
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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import KDialogFormCard from "src/components/k-dialog-form-card.vue";
import {
  allowOnlyIntegerNumbers,
  greaterThanZeroRule,
  numberBetween,
} from "src/helpers/rules";
import { SettingsUpdate } from "src/models/book";

const props = defineProps<{
  maxBooksDimensionCurrent: number;
  purchaseRateCurrent: number;
  reservationDaysCurrent: number;
  saleRateCurrent: number;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent<SettingsUpdate>();

const { t } = useI18n();

const purchaseRate = ref(props.purchaseRateCurrent);
const saleRate = ref(props.saleRateCurrent);
const reservationDays = ref(props.reservationDaysCurrent);
const maxBooksDimension = ref(props.maxBooksDimensionCurrent);

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
