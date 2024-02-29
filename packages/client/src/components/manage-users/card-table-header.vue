<template>
  <q-form
    class="gap-16 items-center q-pa-md row"
    @submit="$emit('addBook', bookISBN)"
  >
    <q-input
      v-model="bookISBN"
      :placeholder="$t('manageUsers.searchHint')"
      class="width-420"
      :debounce="200"
      :rules="[requiredRule, validISBN]"
      lazy-rules="ondemand"
      outlined
    />

    <q-btn
      type="submit"
      :label="$t('book.addBookDialog')"
      :icon="mdiPlus"
      color="accent"
      no-wrap
    />

    <q-space />

    <slot name="side-actions" />
  </q-form>
</template>

<script setup lang="ts">
import { mdiPlus } from "@quasar/extras/mdi-v7";
import { ref } from "vue";
import { requiredRule, validISBN } from "src/helpers/rules";

defineEmits<{
  addBook: [bookISBN: string];
}>();

const bookISBN = ref("");
</script>
