<template>
  <q-btn
    v-if="!isSearchBarActive"
    flat
    :icon="mdiMagnify"
    round
    @click="isSearchBarActive = true"
  />
  <q-input
    v-else
    ref="searchInputBarRef"
    v-model="searchText"
    :bottom-slots="false"
    autofocus
    borderless
    class="full-width q-px-md"
    dark
    debounce="500"
    :placeholder="t('common.search')"
    @blur="hideSearchBar"
  >
    <template #append>
      <q-icon
        v-if="searchText.length > 0"
        :name="mdiClose"
        class="cursor-pointer"
        color="white"
        @click.stop="searchText = ''"
      />
      <q-icon
        v-else
        class="cursor-pointer"
        color="white-54"
        :name="mdiMagnify"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { mdiClose, mdiMagnify } from "@quasar/extras/mdi-v7";
import { QInput } from "quasar";
import { Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits<{
  searchBarActiveStateToggled: [state: boolean];
}>();

const { t } = useI18n();

const searchText = defineModel<string>({ required: true });

const searchInputBarRef = ref() as Ref<QInput>;
const isSearchBarActive = ref(false);

function hideSearchBar() {
  if (searchText.value.length === 0) {
    isSearchBarActive.value = false;
  }
}

watch(isSearchBarActive, (newValue) => {
  emit("searchBarActiveStateToggled", newValue);
});
</script>
