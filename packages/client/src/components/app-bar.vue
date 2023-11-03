<template>
  <q-toolbar class="app-bar q-px-none">
    <q-toolbar-title
      v-if="$slots.default"
      class="app-bar-title col-grow items-center no-wrap row"
    >
      <slot />
    </q-toolbar-title>
    <q-space v-else />

    <slot v-if="$slots.actions" name="actions" />

    <q-input
      v-if="searchTextProxy !== undefined && !hideSearch"
      v-model="searchTextProxy"
      :bottom-slots="false"
      class="bg-white search-bar"
      debounce="500"
      dense
      :label="$t('common.search')"
      outlined
    >
      <template #append>
        <q-icon
          v-if="searchTextProxy.length === 0"
          :name="mdiMagnify"
          class="cursor-pointer"
        />
        <!--
          q-input 'clearable' option would set the model to null (instead of an empty string)
          and won't allow to set the icon color
        -->
        <q-icon
          v-if="searchTextProxy.length > 0"
          :name="mdiCloseCircle"
          class="cursor-pointer"
          @click.stop="searchTextProxy = ''"
        />
      </template>
    </q-input>

    <slot v-if="$slots.prepend" name="prepend" />

    <q-btn
      v-if="$slots['menu-actions'] !== undefined"
      :icon="mdiDotsHorizontal"
      class="q-ml-sm"
      flat
      round
    >
      <q-menu>
        <slot name="menu-actions"></slot>
      </q-menu>
    </q-btn>
  </q-toolbar>
</template>

<script setup lang="ts">
import {
  mdiCloseCircle,
  mdiDotsHorizontal,
  mdiMagnify,
} from "@quasar/extras/mdi-v7";

defineEmits({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  "update:searchText": (payload: string | number | null) => true,
});

withDefaults(
  defineProps<{
    hideSearch?: boolean;
  }>(),
  {
    hideSearch: false,
  },
);

const searchTextProxy = defineModel<string>("searchText");
</script>

<style lang="scss" scoped>
// [1] Required in order to allow the element to be collapsed under its actual length
.search-bar {
  flex: 1;
  max-width: 260px;
  min-width: 150px;

  // [1]
  width: 0;
}

.app-bar {
  // Allows to keep a consistent height even when search-bar is not used
  min-height: 64px;
}

.app-bar-title {
  // [1]
  width: 0;
}
</style>
