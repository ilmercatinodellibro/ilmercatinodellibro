<template>
  <q-form
    class="gap-16 items-center q-pt-md q-px-md row"
    @submit="$emit('addBook', bookISBN)"
  >
    <q-input
      v-model="bookISBN"
      :placeholder="searchLabel ?? $t('manageUsers.searchHint')"
      :rules="[requiredRule, validISBN]"
      class="width-420"
      lazy-rules="ondemand"
      outlined
      hide-bottom-space
    />

    <q-btn
      :label="$t('book.addBookDialog')"
      :icon="mdiPlus"
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
import { requiredRule, validISBN } from "src/helpers/rules";

defineProps<{
  searchLabel?: string;
}>();

defineEmits<{
  addBook: [bookISBN: string];
}>();

const bookISBN = defineModel<string>("bookIsbn", { required: true });
</script>
