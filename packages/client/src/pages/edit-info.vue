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
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import InfoEditor from "src/components/info-editor.vue";
import { RetailLocationInfo } from "src/models/retail-location";
import { useRetailLocationService } from "src/services/retail-location";

const { t, locale } = useI18n();

const selectedTab = ref(RetailLocationInfo.FAQ);

const { selectedLocation } = useRetailLocationService();
const currentInfo = computed<Record<RetailLocationInfo, string>>(
  () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    selectedLocation.value.infoPagesContent[locale.value] as Record<
      RetailLocationInfo,
      string
    >,
);
const editorModel = ref<string>(currentInfo.value[selectedTab.value]);

async function switchTab(tab: RetailLocationInfo) {
  await updateInfo();
  selectedTab.value = tab;
  editorModel.value = currentInfo.value[tab];
}

async function updateInfo() {
  // TODO: update info
}

watch(locale, () => {
  // Update model on locale change
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
}
</style>
