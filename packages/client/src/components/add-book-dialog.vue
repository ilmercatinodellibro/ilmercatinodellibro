<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('book.addBookDialog')"
      :submit-label="$t('common.add')"
      size="sm"
      @submit="addBookToCatalog(book)"
      @cancel="onDialogCancel"
    >
      <q-card-section class="column gap-16">
        <q-input
          v-model="book.isbnCode"
          :label="$t('book.fields.isbn')"
          :rules="[requiredRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model="book.authorsFullName"
          :label="$t('book.fields.author')"
          :rules="[requiredRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model="book.title"
          :label="$t('book.fields.title')"
          :rules="[requiredRule]"
          type="textarea"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model="book.publisherName"
          :label="$t('book.fields.publisher')"
          :rules="[requiredRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model="book.subject"
          :label="$t('book.fields.subject')"
          :rules="[requiredRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model.number="book.originalPrice"
          :label="$t('book.fields.price')"
          :rules="[requiredRule, greaterThanZeroRule]"
          type="number"
          step="0.01"
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
import { useI18n } from "vue-i18n";
import { BookCreateInput } from "src/@generated/graphql";
import { notifyError } from "src/helpers/error-messages";
import { greaterThanZeroRule, requiredRule } from "src/helpers/rules";
import { useCreateNewBookMutation } from "src/services/book.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import KDialogFormCard from "./k-dialog-form-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
  useDialogPluginComponent();

const { selectedLocation } = useRetailLocationService();

const book = reactive<BookCreateInput>({
  authorsFullName: "",
  isbnCode: "",
  originalPrice: 0,
  publisherName: "",
  subject: "",
  retailLocationId: selectedLocation.value.id,
  title: "",
});

const { t } = useI18n();
const { createBook } = useCreateNewBookMutation();

async function addBookToCatalog(newBook: BookCreateInput) {
  try {
    await createBook({
      input: newBook,
    });

    onDialogOK();
  } catch {
    notifyError(t("bookErrors.addBookToCatalog"));
  }
}
</script>
