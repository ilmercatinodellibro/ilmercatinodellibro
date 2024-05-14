<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="layout-background">
      <q-page class="column fit flex-center q-pa-xl">
        <h4 class="m-mb-36 q-mt-none readability-max-width text-accent">
          {{ t("home.title") }}
        </h4>
        <p
          class="m-mb-36 q-ma-none readability-max-width text-center text-h5 text-primary"
        >
          {{ t("home.locationSelectionDescription") }}
        </p>

        <div class="items-center justify-center row">
          <q-spinner v-if="loading" size="xl" />

          <action-box
            v-for="location in retailLocations"
            :key="location.id"
            :action-text="location.name"
            :button-label="t('auth.login')"
            @action-clicked="selectLocation(location)"
          />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import ActionBox from "src/components/action-box.vue";
import { AvailableRouteNames } from "src/models/routes";
import { useRetailLocationService } from "src/services/retail-location";
import { RetailLocationFragment } from "src/services/retail-location.graphql";

const { retailLocations, loading, selectedLocationId } =
  useRetailLocationService();
const { t } = useI18n();

const router = useRouter();
async function selectLocation(location: RetailLocationFragment) {
  selectedLocationId.value = location.id;
  await router.push({
    name: AvailableRouteNames.Login,
    params: { locationId: location.id },
  });
}
</script>
