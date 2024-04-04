<template>
  <q-form
    class="gap-16 items-center q-pa-md row"
    @submit="$emit('addBook', bookISBN)"
  >
    <q-input
      v-model="bookISBN"
      :hide-bottom-space="bookISBN.length === 0"
      :placeholder="searchLabel ?? $t('manageUsers.searchHint')"
      :rules="[requiredRule, validISBN]"
      class="width-420"
      lazy-rules="ondemand"
      outlined
      hide-bottom-space
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
import { requiredRule, validISBN } from "src/helpers/rules";

defineProps<{
  searchLabel?: string;
}>();

defineEmits<{
  addBook: [bookISBN: string];
}>();

const bookISBN = defineModel<string>("bookIsbn", { required: true });
</script>
