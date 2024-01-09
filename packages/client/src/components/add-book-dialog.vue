<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="dialog-card">
      <q-card-section class="q-px-lg q-py-md">
        <div class="text-h6 text-primary">
          {{ $t("book.addBookDialog") }}
        </div>
      </q-card-section>
      <q-separator />
      <q-form @submit="onDialogOK(newBook)">
        <q-card-section class="q-col-gutter-sm q-pa-lg">
          <q-input
            v-model="newBook.isbnCode"
            :label="$t('book.fields.isbn')"
            :rules="[requiredRule]"
            type="text"
            lazy-rules
            outlined
          />
          <q-input
            v-model="newBook.authorsFullName"
            :label="$t('book.fields.author')"
            :rules="[requiredRule]"
            type="text"
            lazy-rules
            outlined
          />
          <q-input
            v-model="newBook.title"
            :label="$t('book.fields.title')"
            :rules="[requiredRule]"
            type="textarea"
            lazy-rules
            outlined
          />
          <q-input
            v-model="newBook.publisherName"
            :label="$t('book.fields.publisher')"
            :rules="[requiredRule]"
            type="text"
            lazy-rules
            outlined
          />
          <q-select
            v-model="newBook.subject"
            :options="subjects"
            :label="$t('book.fields.subject')"
            :rules="[requiredRule]"
            lazy-rules
            outlined
          />
          <q-input
            v-model="newBook.originalPrice"
            :label="$t('book.fields.price')"
            :rules="[requiredRule]"
            type="text"
            lazy-rules
            outlined
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn :label="$t('common.cancel')" flat @click="onDialogCancel" />
          <q-btn :label="$t('common.add')" type="submit" flat />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { Book } from "src/@generated/graphql";
import { requiredRule } from "src/helpers/rules";

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
  useDialogPluginComponent();

defineEmits({
  ...useDialogPluginComponent.emitsObject,
});

defineProps<{
  subjects: string[];
}>();

const newBook = ref({} as Book);
</script>

<style scoped lang="scss">
.dialog-card {
  width: 360px;
}
</style>
