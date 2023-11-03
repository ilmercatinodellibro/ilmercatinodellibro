<template>
  <q-page class="flex items-center justify-center">
    <q-card flat>
      <q-card-section class="q-pt-none text-dark text-h6">
        {{ t("auth.checkInbox") }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
