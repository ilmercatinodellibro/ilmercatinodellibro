<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="mobile-responsive-dialog">
      <q-card-section class="bg-primary text-h6 text-white">
        {{ t("general.colorPicker") }}
      </q-card-section>

      <q-card-section>
        <q-input v-model="colorRef" filled>
          <template #append>
            <q-icon :name="mdiEyedropper" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-color v-model="colorRef" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn :label="t('common.cancel')" flat @click="onDialogCancel" />
        <q-btn
          :label="t('common.confirm')"
          flat
          @click="onDialogOK(colorRef)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiEyedropper } from "@quasar/extras/mdi-v7";
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();
defineEmits(useDialogPluginComponent.emits);

const props = defineProps<{
  color: string;
}>();

const colorRef = ref(props.color);
</script>
