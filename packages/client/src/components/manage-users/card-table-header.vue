<template>
  <q-form
    class="gap-16 items-center no-wrap q-pt-md q-px-md row"
    @submit="handleSubmit"
  >
    <q-input
      v-model="bookISBN"
      :placeholder="searchLabel ?? $t('manageUsers.searchHint')"
      :rules="[validISBN]"
      class="width-420"
      lazy-rules="ondemand"
      outlined
    />

    <q-btn
      :icon="mdiPlus"
      :label="$t('book.addBookDialog')"
      class="bottom-separator-20"
      color="accent"
      no-wrap
      type="submit"
    />

    <q-space />

    <div class="bottom-separator-20 gap-16 no-padding row">
      <slot name="side-actions" />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { mdiPlus } from "@quasar/extras/mdi-v7";
import { ref } from "vue";
import { validISBN } from "src/helpers/rules";

defineProps<{
  searchLabel?: string;
}>();

const emit = defineEmits<{
  addBook: [bookISBN: string];
}>();

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
