<template>
  <q-page class="column fit flex-center no-wrap">
    <div
      class="column flex-delegate-height-management info-editor-container no-wrap"
    >
      <q-tabs
        :model-value="selectedTab"
        active-color="accent"
        class="bg-white"
        @update:model-value="(tab) => switchTab(tab)"
      >
        <q-tab
          v-for="name in RetailLocationInfo"
          :key="name"
          :name
          :label="$t(`retailLocation.info.${name}`)"
          class="full-width"
        />
      </q-tabs>
      <q-tab-panels v-model="selectedTab" class="bg-transparent">
        <q-tab-panel
          v-for="name in RetailLocationInfo"
          :key="name"
          :name
          class="column no-padding no-wrap"
        >
          <info-editor v-model="editorModel" class="full-height">
            <template #toolbar-actions>
              <q-btn
                :disable="!isModified"
                :label="t('general.saveChanges')"
                class="save-btn"
                color="accent"
                @click="updateInfo()"
              />
            </template>
          </info-editor>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Dialog } from "quasar";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import InfoEditor from "src/components/info-editor.vue";
import { RetailLocationInfo } from "src/models/retail-location";
import { useRetailLocationService } from "src/services/retail-location";
import { useUpdateRetailLocationInfoMutation } from "src/services/retail-location.graphql";

const { t, locale } = useI18n();

const selectedTab = ref(RetailLocationInfo.FAQ);

const { selectedLocation } = useRetailLocationService();
const currentInfo = computed(
  () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (
      selectedLocation.value.infoPagesContent as Record<
        string,
        Record<RetailLocationInfo, string>
      >
    )[locale.value]!,
);
const editorModel = ref(currentInfo.value[selectedTab.value]);
const isModified = computed(
  () => currentInfo.value[selectedTab.value] !== editorModel.value,
);

function openConfirmDialog() {
  return Dialog.create({
    cancel: t("general.discardChanges"),
    message: t("general.leavingWithoutSaving"),
    ok: t("general.saveAndProceed"),
    persistent: true,
    title: t("general.unsavedChanges"),
  });
}

function switchTab(tab: RetailLocationInfo) {
  const updateTab = () => {
    selectedTab.value = tab;
    editorModel.value = currentInfo.value[tab];
  };

  if (isModified.value) {
    openConfirmDialog()
      .onOk(async () => {
        await updateInfo();
        updateTab();
      })
      .onCancel(updateTab);
  } else {
    updateTab();
  }
}

const { updateRetailLocationInfo } = useUpdateRetailLocationInfoMutation();
async function updateInfo(text?: string, language?: string) {
  try {
    await updateRetailLocationInfo({
      input: {
        languageId: language ?? locale.value,
        retailLocationId: selectedLocation.value.id,
        [selectedTab.value]: text ?? editorModel.value,
      },
    });
  } catch {
    t("retailLocation.errors.couldNotUpdateInfo");
  }
}

watch(locale, (_, previousLocale) => {
  const updateModel = () => {
    editorModel.value = currentInfo.value[selectedTab.value];
  };

  if (
    (
      selectedLocation.value.infoPagesContent as Record<
        string,
        Record<RetailLocationInfo, string>
      >
    )[previousLocale]?.[selectedTab.value] !== editorModel.value
  ) {
    openConfirmDialog()
      .onOk(async () => {
        await updateInfo(editorModel.value, previousLocale);
        updateModel();
      })
      .onCancel(updateModel);
  } else {
    updateModel();
  }
});

onBeforeRouteLeave(async () => {
  if (isModified.value) {
    await new Promise<void>((resolve) => {
      openConfirmDialog()
        .onOk(async () => {
          await updateInfo();
          resolve();
        })
        .onCancel(resolve);
    });
    return;
  }
});
</script>

<style scoped lang="scss">
.info-editor-container {
  margin: 100px 0;
  max-width: 732px;

  @media screen and (max-width: $breakpoint-sm) {
    margin: 0;
    max-width: 100%;
  }
}

.save-btn {
  float: right;
  width: auto;
}
</style>
