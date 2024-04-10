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
            @click="saveTheme()"
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
          <img class="logo-container q-pa-md" :src="theme.logo" />
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

          <q-btn color="black-12" outline @click="resetLogo">
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
        <theme-color-section name="primary" />
        <q-separator />
        <theme-color-section name="secondary" />
        <q-separator />
        <theme-color-section name="accent" />
      </q-card-section>

      <q-page-sticky v-if="isSmallScreen" expand position="bottom">
        <q-separator class="full-width" />

        <div class="full-width q-pa-md">
          <q-btn
            class="full-width"
            color="secondary"
            :label="t('general.saveChanges')"
            text-color="black-54"
            :disable="!hasPendingChanges"
            @click="saveTheme()"
          />
        </div>
      </q-page-sticky>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { Dialog, Notify, QFile, Screen } from "quasar";
import { Ref, computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import ConfirmDialog from "src/components/confirm-dialog.vue";
import ThemeColorSection from "src/components/theme-color-section.vue";
import { useTheme } from "src/composables/use-theme";
import { notifyError } from "src/helpers/error-messages";
import { AvailableRouteNames } from "src/models/routes";

const { t } = useI18n();
const { theme, defaultTheme, hasPendingChanges, saveChanges, setDefaults } =
  useTheme();

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

function onRejected() {
  notifyError("Uploaded file did not pass validation check");
}

function resetLogo() {
  theme.value.logo = defaultTheme.logo;
  imagePickerModel.value = undefined;
}

async function saveTheme() {
  await saveChanges(imagePickerModel.value);

  Notify.create({
    message: t("general.themeChanged"),
    color: "positive",
  });
}

watch(imagePickerModel, (newImage) => {
  if (!newImage) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Data = event.target?.result as string | undefined;
    if (base64Data) {
      theme.value.logo = base64Data;
    }
  };
  reader.readAsDataURL(newImage);
});
</script>

<style lang="scss" scoped>
.theme-card {
  min-width: 50vw;
}

.logo-container {
  border: 2px solid var(--q-primary);
  max-height: 200px;
  width: 100%;

  @media screen and (min-width: $breakpoint-sm-min) {
    width: 400px;
  }
}
</style>
