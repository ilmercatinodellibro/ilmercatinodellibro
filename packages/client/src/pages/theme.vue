<template>
  <q-page class="justify-center row">
    <q-card
      :class="isSmallScreen ? 'full-width' : 'q-ma-md'"
      class="relative theme-card"
    >
      <template v-if="!isSmallScreen">
        <q-card-section class="items-center justify-end row">
          <q-btn
            color="secondary"
            :label="t('general.saveChanges')"
            text-color="black-54"
            :disable="!hasPendingChanges"
            @click="saveChanges()"
          />
        </q-card-section>
        <q-separator />
      </template>
      <q-card-section
        :class="
          !isSmallScreen ? 'row q-pl-xl q-ml-xl' : 'column justify-center'
        "
        class="gap-16"
      >
        <div class="column no-wrap">
          <img class="bg-primary logo-container q-pa-md" :src="theme.logo" />
          <p class="q-mt-sm text-black-54 text-center text-subtitle">
            {{ t("general.logoSizeMessage") }}
          </p>
        </div>
        <div
          class="column gap-16 justify-center"
          :class="isSmallScreen ? 'full-width' : 'q-mb-xl'"
        >
          <q-btn color="black-12" outline @click="imagePickerRef.pickFiles()">
            <span class="text-black-87">{{ t("general.uploadLogo") }}</span>
          </q-btn>
          <q-btn
            color="black-12"
            outline
            @click="theme.logo = defaultTheme.logo"
          >
            <span class="text-black-87"> {{ t("general.resetLogo") }} </span>
          </q-btn>
        </div>
        <q-file
          ref="imagePickerRef"
          v-model="imagePickerModel"
          accept=".png,.svg"
          class="hidden"
          @rejected="onRejected"
        />
      </q-card-section>
      <q-card-section class="column gap-16">
        <div class="items-center justify-between row">
          <div class="items-start row">
            <div class="bg-primary circle q-ml-sm q-mt-sm"></div>
            <div class="column q-ml-xl">
              <span class="line-height-75 text-size-16">{{
                t("general.primary")
              }}</span>
              <span class="text-black-54 text-subtitle">
                {{ theme.colors.primary }}
              </span>
              <span class="text-black-54 text-subtitle">
                {{ RGBTheme.primary }}
              </span>
            </div>
          </div>
          <q-btn
            color="black-12"
            outline
            @click="openColorPickerDialog('primary')"
          >
            <span class="text-black-87">
              {{ t("common.edit") }}
            </span>
          </q-btn>
        </div>
        <q-separator />
        <div class="items-center justify-between row">
          <div class="items-start row">
            <div class="bg-secondary circle q-ml-sm q-mt-sm"></div>
            <div class="column q-ml-xl">
              <span class="line-height-75 text-size-16">{{
                t("general.secondary")
              }}</span>
              <span class="text-black-54 text-subtitle">
                {{ theme.colors.secondary }}
              </span>
              <span class="text-black-54 text-subtitle">
                {{ RGBTheme.secondary }}
              </span>
            </div>
          </div>
          <q-btn
            color="black-12"
            outline
            @click="openColorPickerDialog('secondary')"
          >
            <span class="text-black-87">
              {{ t("common.edit") }}
            </span>
          </q-btn>
        </div>
        <q-separator />
        <div class="items-center justify-between row">
          <div class="items-start row">
            <div class="bg-accent circle q-ml-sm q-mt-sm"></div>
            <div class="column q-ml-xl">
              <span class="line-height-75 text-size-16">{{
                t("general.accent")
              }}</span>
              <span class="text-black-54 text-subtitle">
                {{ theme.colors.accent }}
              </span>
              <span class="text-black-54 text-subtitle">
                {{ RGBTheme.accent }}
              </span>
            </div>
          </div>
          <q-btn
            color="black-12"
            outline
            @click="openColorPickerDialog('accent')"
          >
            <span class="text-black-87">
              {{ t("common.edit") }}
            </span>
          </q-btn>
        </div>
      </q-card-section>
      <q-page-sticky v-if="isSmallScreen" expand position="bottom">
        <q-separator class="full-width" />
        <div class="full-width q-pa-md">
          <q-btn
            class="full-width"
            color="secondary"
            :label="t('general.saveChanges')"
            text-color="black-54"
            @click="saveChanges()"
          />
        </div>
      </q-page-sticky>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { Dialog, QFile, Screen } from "quasar";
import { Ref, computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import ColorPickerDialog from "components/color-picker-dialog.vue";
import ConfirmDialog from "src/components/confirm-dialog.vue";
import { ThemeColor, useTheme } from "src/composables/use-theme";
import { notifyError } from "src/helpers/error-messages";
import { AvailableRouteNames } from "src/models/routes";

const { t } = useI18n();
const {
  theme,
  defaultTheme,
  RGBTheme,
  hasPendingChanges,
  saveChanges,
  setDefaults,
} = useTheme();

const imagePickerModel = ref<File>();
const imagePickerRef = ref() as Ref<QFile>;
const isSmallScreen = computed(() => Screen.lt.sm);

onBeforeRouteLeave((_to, from, next) => {
  if (from.name !== AvailableRouteNames.Theme || !hasPendingChanges.value) {
    next();
    return;
  }
  Dialog.create({
    component: ConfirmDialog,
    componentProps: {
      message: t("general.leaveWithoutSaving"),
    },
  })
    .onOk(() => {
      setDefaults();
      next();
    })
    .onCancel(() => {
      next(false);
    });
});

function openColorPickerDialog(colorType: ThemeColor) {
  Dialog.create({
    component: ColorPickerDialog,
    componentProps: {
      color: theme.value.colors[colorType],
    },
  }).onOk((newColor: string) => {
    theme.value.colors[colorType] = newColor;
  });
}

function onRejected() {
  notifyError("Uploaded file did not pass validation check");
}

watch([imagePickerModel], ([newImage]) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Data = event.target?.result as string | undefined;
    if (base64Data) {
      theme.value.logo = base64Data;
    }
  };
  if (!newImage) {
    return;
  }

  reader.readAsDataURL(newImage);
});
</script>

<style lang="scss" scoped>
.theme-card {
  min-width: 50vw;
}

.circle {
  border-radius: 50px;
  height: 24px;
  width: 24px;
}

.logo-container {
  border: 1px solid rgb(0 0 0 / 12%);
  max-height: 200px;
  width: 100%;

  @media screen and (min-width: $breakpoint-sm-min) {
    width: 400px;
  }
}
</style>
