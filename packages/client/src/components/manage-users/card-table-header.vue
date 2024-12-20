<template>
  <q-form
    :class="{ 'column items-stretch': isMobile }"
    class="gap-16 items-center no-wrap q-pt-md q-px-md row"
    @submit="handleSubmit"
  >
    <q-input
      v-model="bookISBN"
      :class="{ 'max-width-420': !isMobile }"
      :placeholder="searchLabel ?? $t('manageUsers.searchHint')"
      :rules="[validISBN]"
      class="full-width"
      lazy-rules="ondemand"
      outlined
    />

    <q-btn
      :class="{ 'bottom-separator-20': !isMobile }"
      :icon="mdiPlus"
      :label="$t('book.addBookDialog')"
      color="accent"
      no-wrap
      type="submit"
    />

    <q-space v-if="!isMobile" />

    <div
      :class="{ 'col column': isMobile, 'bottom-separator-20': !isMobile }"
      class="gap-16 no-padding no-wrap row"
    >
      <slot name="side-actions" />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { mdiPlus } from "@quasar/extras/mdi-v7";
import { ref } from "vue";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { validISBN } from "src/helpers/rules";

defineProps<{
  searchLabel?: string;
}>();

const emit = defineEmits<{
  addBook: [bookISBN: string];
}>();

const { isMobile } = useLateralDrawer();

const bookISBN = ref("");

function handleSubmit() {
  const toEmit = bookISBN.value.trim();

  if (toEmit.length === 0) {
    return;
  }

  emit("addBook", toEmit);

  bookISBN.value = "";
}
</script>
