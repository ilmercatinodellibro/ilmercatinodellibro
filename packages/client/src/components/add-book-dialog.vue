<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="$t('book.addBookDialog')"
      :submit-label="$t('common.add')"
      size="sm"
      @submit="onDialogOK(newBook)"
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
        <q-input
          v-model="newBook.subject"
          :label="$t('book.fields.subject')"
          :rules="[requiredRule]"
          type="text"
          lazy-rules
          outlined
          hide-bottom-space
        />
        <q-input
          v-model.number="newBook.originalPrice"
          :label="$t('book.fields.price')"
          :rules="[requiredRule, greaterThanZeroRule]"
          type="number"
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
import { BookCreateInput } from "src/@generated/graphql";
import { greaterThanZeroRule, requiredRule } from "src/helpers/rules";
import { useRetailLocationService } from "src/services/retail-location";
import KDialogFormCard from "./k-dialog-form-card.vue";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
  useDialogPluginComponent();

const { selectedLocation } = useRetailLocationService();

// TODO: Use the input type after implementing the GraphQL mutation
const newBook = reactive<Omit<BookCreateInput, "id">>({
  authorsFullName: "",
  isbnCode: "",
  originalPrice: 0,
  publisherName: "",
  subject: "",
  retailLocationId: selectedLocation.value.id,
  title: "",
});
</script>
