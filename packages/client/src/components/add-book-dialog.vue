<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('book.addBookDialog')"
      :save-label="$t('book.filter')"
      size="sm"
      @save="onDialogOK(newBook)"
      @cancel="onDialogCancel"
    >
      <q-card-section class="column gap-16">
        <q-input
          v-model="newBook.isbnCode"
          :label="$t('book.fields.isbn')"
          :rules="[requiredRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model="newBook.authorsFullName"
          :label="$t('book.fields.author')"
          :rules="[requiredRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model="newBook.title"
          :label="$t('book.fields.title')"
          :rules="[requiredRule]"
          type="textarea"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model="newBook.publisherName"
          :label="$t('book.fields.publisher')"
          :rules="[requiredRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-select
          v-model="newBook.subject"
          :options="subjects"
          :label="$t('book.fields.subject')"
          :rules="[requiredRule]"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model="newBook.originalPrice"
          :label="$t('book.fields.price')"
          :rules="[requiredRule, greaterThanZeroRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { reactive } from "vue";
import { greaterThanZeroRule, requiredRule } from "src/helpers/rules";
import { BookSummaryFragment } from "src/services/book.graphql";
import KDialogFormCard from "./k-dialog-form-card.vue";

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
  useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);

const subjects = ["Subject1", "Subject2"];

const newBook = reactive<Omit<BookSummaryFragment, "id">>({
  authorsFullName: "",
  isbnCode: "",
  originalPrice: 0,
  publisherName: "",
  subject: "",
  title: "",
});
</script>

<style scoped lang="scss">
.dialog-card {
  width: 360px;
}
</style>
