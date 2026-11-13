<template>
  <q-btn-dropdown :label="selectedLanguageLabel" auto-close color="accent">
    <q-list>
      <q-item
        v-for="language in languages"
        :key="language.code"
        clickable
        @click="setLanguage(language.code)"
      >
        <q-item-section>
          <q-item-label>
            {{ language.label }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { setLanguage } from "@/boot/i18n";
import { languages } from "@/models/language";
const { locale } = useI18n();
const selectedLanguageLabel = computed(
  () => languages.find(({ code }) => code === locale.value)?.label,
);
</script>
