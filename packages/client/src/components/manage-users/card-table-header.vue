<template>
  <q-form
    class="gap-16 items-center q-pa-md row"
    @submit="$emit('addBook', bookISBN)"
  >
    <q-input
      v-model="bookISBN"
      :placeholder="$t('manageUsers.searchHint')"
      class="width-420"
      :rules="[requiredRule, validISBN]"
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

defineEmits<{
  addBook: [bookISBN: string];
}>();

const bookISBN = defineModel<string>("bookIsbn", { required: true });
</script>
