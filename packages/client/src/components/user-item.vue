<template>
  <q-item class="q-py-xs user-item" clickable>
    <q-item-section avatar>
      <q-avatar class="bg-white">
        <span class="text-black-87 text-size-16">
          {{ user.firstname.charAt(0) + user.lastname.charAt(0) }}
        </span>
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ user.firstname }} {{ user.lastname }}</q-item-label>
      <q-item-label class="text-caption text-white-54" caption>
        {{ user.email }}
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-icon :name="mdiMenuDown" color="white" />
    </q-item-section>

    <q-menu fit>
      <q-list class="full-width min-width-200">
        <q-item clickable :to="{ name: AvailableRouteNames.ResetPassword }">
          <q-item-section>
            {{ t(`routesNames.${AvailableRouteNames.ResetPassword}`) }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
</template>

<script setup lang="ts">
import { mdiMenuDown } from "@quasar/extras/mdi-v7";
import { useI18n } from "vue-i18n";
import { AvailableRouteNames } from "src/models/routes";
import { UserSummaryFragment } from "src/services/auth.graphql";

defineProps<{
  user: UserSummaryFragment;
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.user-item {
  border: 1px rgb(255 255 255 / 12%) solid;
  border-radius: 4px;
}
</style>
