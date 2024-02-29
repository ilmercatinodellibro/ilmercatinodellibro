<template>
  <span class="gap-16 items-center q-pa-md row">
    <q-input
      v-model="bookISBN"
      :placeholder="$t('manageUsers.searchHint')"
      class="width-420"
      debounce="200"
      outlined
      @keyup.enter="$emit('addBook', bookISBN)"
    />
    <q-btn
      :label="$t('book.addBookDialog')"
      :icon="mdiPlus"
      color="accent"
      no-wrap
      @click="$emit('addBook', bookISBN)"
    />
    <q-space />
    <slot name="side-actions" />
  </span>
</template>

<script setup lang="ts">
import { mdiPlus } from "@quasar/extras/mdi-v7";
import { ref } from "vue";

defineEmits<{
  addBook: [bookISBN: string];
}>();

const bookISBN = ref("");
</script>
