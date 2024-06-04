<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-form-card
      :submit-label="$t('manageUsers.returnBook')"
      :title="$t('manageUsers.returnBookTitle')"
      size="sm"
      @submit="onDialogOK(bookCopy.id)"
      @cancel="onDialogCancel"
    >
      <q-card-section class="column gap-16 no-wrap">
        <q-input
          :model-value="bookCopy.book.isbnCode"
          :label="$t('book.fields.isbn')"
          outlined
          readonly
        />
        <q-input
          :model-value="bookCopy.book.authorsFullName"
          :label="$t('book.fields.author')"
          outlined
          readonly
        />
        <q-input
          :model-value="bookCopy.book.subject"
          :label="$t('book.fields.subject')"
          outlined
          readonly
        />
        <q-input
          :model-value="bookCopy.book.title"
          :label="$t('book.fields.title')"
          outlined
          readonly
        />
        <q-input
          :model-value="bookCopy.book.publisherName"
          :label="$t('book.fields.publisher')"
          outlined
          readonly
        />
        <q-checkbox :model-value="user.discount" disable>
          <template #default>
            <span class="q-px-sm text-black-87">
              {{ $t("manageUsers.editUser.discount") }}
            </span>
            <q-icon :name="mdiInformationOutline" size="24px">
              <q-tooltip> {{ $t("manageUsers.iseeInfoTooltip") }}</q-tooltip>
            </q-icon>
          </template>
        </q-checkbox>
        <q-input
          :model-value="moneyToReimburse"
          :label="$t('manageUsers.moneyToGive')"
          outlined
          readonly
          suffix="€"
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiInformationOutline } from "@quasar/extras/mdi-v7";
import { useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import { UserFragment } from "src/services/user.graphql";
import KDialogFormCard from "../k-dialog-form-card.vue";

const { user, bookCopy } = defineProps<{
  bookCopy: BookCopyDetailsFragment;
  user: UserFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent<string>();

const { selectedLocation } = useRetailLocationService();

const moneyToReimburse = computed(() =>
  user.discount
    ? (bookCopy.book.originalPrice * selectedLocation.value.buyRate) / 100
    : (bookCopy.book.originalPrice * selectedLocation.value.sellRate) / 100,
);
</script>
