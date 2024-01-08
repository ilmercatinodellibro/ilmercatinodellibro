<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="dialog-wrapper">
      <q-card-section>
        <div class="text-h6">
          {{
            $t(
              "manageUsers.booksMovementsDialog." +
                (type === "sold" ? "soldTitle" : "purchasedTitle"),
              [userData.firstname, userData.lastname],
            )
          }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <dialog-table
          :columns="type === 'purchased' ? purchasedColumns : soldColumns"
      /></q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="$t('common.close')" @click="onDialogOK(userData)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QDialog, useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { User } from "src/@generated/graphql";
import DialogTable from "./dialog-table.vue";

const { t } = useI18n();

defineProps<{
  type: "sold" | "purchased";
  userData: User;
}>();

const soldColumns = computed(() => [
  {
    label: t("book.fields.isbn"),
    field: "isbn",
    name: "isbn",
  },
  {
    label: t("book.code"),
    field: "code",
    name: "code",
  },
  {
    label: t("book.originalCode"),
    field: "originalCode",
    name: "originalCode",
  },
  {
    label: t("book.fields.author"),
    field: "author",
    name: "author",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.subject"),
    field: "subject",
    name: "subject",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.conditions"),
    field: "conditions",
    name: "conditions",
  },
  {
    label: t("book.fields.title"),
    field: "title",
    name: "title",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.publisher"),
    field: "publisher",
    name: "publisher",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("manageUsers.booksMovementsDialog.soldTo"),
    field: "soldTo",
    name: "soldTo",
  },
  {
    label: "",
    field: "problems",
    name: "problems",
  },
  {
    label: "",
    field: "",
    name: "history",
  },
]);

const purchasedColumns = computed(() => [
  {
    label: t("book.fields.isbn"),
    field: "isbn",
    name: "isbn",
  },
  {
    label: t("book.code"),
    field: "code",
    name: "code",
  },
  {
    label: t("book.fields.author"),
    field: "author",
    name: "author",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.subject"),
    field: "subject",
    name: "subject",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.conditions"),
    field: "conditions",
    name: "conditions",
  },
  {
    label: t("book.fields.title"),
    field: "title",
    name: "title",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.publisher"),
    field: "publisher",
    name: "publisher",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("manageUsers.booksMovementsDialog.purchasedAt"),
    //TODO: Insert field name
    field: "",
    name: "purchasedAt",
  },
  {
    label: t("manageUsers.booksMovementsDialog.theVendor"),
    field: "vendor",
    name: "vendor",
  },
  {
    label: t("manageUsers.actions"),
    field: "",
    name: "actions",
  },
]);

const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>

<style scoped lang="scss">
.dialog-wrapper {
  max-width: 100% !important;
}
</style>
