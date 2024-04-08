<template>
  <q-page class="column flex-center">
    <q-card class="q-ma-md width-700">
      <k-dialog-card
        :title="t('sidebar.settings')"
        actions-padding
        size="fullscreen"
      >
        <q-card-section class="column gap-24 no-wrap q-pa-lg">
          <q-input
            v-model="purchaseRate"
            :placeholder="t('general.settings.purchaseRate')"
            type="number"
            outlined
          />
          <q-input
            v-model="saleRate"
            :placeholder="t('general.settings.saleRate')"
            type="number"
            outlined
          />
          <q-input
            v-model="reservationDays"
            :placeholder="t('general.settings.reservationDays')"
            type="number"
            outlined
          />
          <q-input
            v-model="maxBooksDimension"
            :placeholder="t('general.settings.maxBooksDimension')"
            type="number"
            outlined
          />
        </q-card-section>

        <template #card-actions>
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

          <q-btn :label="t('common.cancel')" flat @click="router.back()" />
          <q-btn :label="t('common.save')" flat @click="updateSettings()" />
        </template>
      </k-dialog-card>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { mdiInformationOutline } from "@quasar/extras/mdi-v7";
import { Dialog } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import KDialogCard from "src/components/k-dialog-card.vue";

const { t } = useI18n();

const router = useRouter();

const purchaseRate = ref<number>();
const saleRate = ref<number>();
const reservationDays = ref<number>();
const maxBooksDimension = ref<number>();

function updateSettings() {
  // FIXME: update the settings
}

function confirmReset() {
  Dialog.create({
    title: t("general.settings.resetButton"),
    message: t("general.settings.resetMessage"),
    cancel: t("cancel"),
    ok: t("general.settings.resetConfirmButton"),
  }).onOk(() => {
    // FIXME: perform the yearly reset
  });
}
</script>
