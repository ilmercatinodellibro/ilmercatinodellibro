<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :cancel-label="$t('common.close')"
      :title="$t('manageUsers.booksMovementsDialog.problemsHistory')"
      @cancel="onDialogCancel"
    >
      <q-card-section
        class="column flex-delegate-height-management full-height no-padding"
      >
        <dialog-table
          v-if="bookCopy.problems?.length && bookCopy.problems.length > 0"
          :columns="columns"
          :rows="bookCopy.problems"
        />

        <div v-else class="full-width q-pa-md">
          {{ t("manageUsers.booksMovementsDialog.noProblems") }}
        </div>
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QTableColumn, date, useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ProblemType } from "src/@generated/graphql";
import {
  BookCopyDetailsFragment,
  ProblemDetailsFragment,
} from "src/services/book-copy.graphql";
import { UserSummaryFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import DialogTable from "./dialog-table.vue";

defineProps<{
  bookCopy: BookCopyDetailsFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const { formatDate } = date;

const { t } = useI18n();

const columns = computed<QTableColumn<ProblemDetailsFragment>[]>(() => [
  {
    label: t("common.date"),
    field: "createdAt",
    name: "createdAt",
    align: "left",
    format: (date: number) => formatDate(date, "DD/MM/YYYY[ - ]hh:mm"),
  },
  {
    label: t("manageUsers.booksMovementsDialog.problemType"),
    field: "type",
    name: "type",
    align: "left",
    format: (type: ProblemType) =>
      t(`manageUsers.booksMovementsDialog.problemTypes.${type}`),
  },
  {
    label: t("manageUsers.booksMovementsDialog.details"),
    field: "details",
    name: "details",
    align: "left",
  },
  {
    label: t("manageUsers.booksMovementsDialog.reportedBy"),
    field: "createdBy",
    name: "created-by",
    align: "left",
    format: (creator: UserSummaryFragment) =>
      `${creator.firstname} ${creator.lastname}`,
  },
  {
    label: t("manageUsers.booksMovementsDialog.resolutionDate"),
    field: "resolvedAt",
    name: "resolved-at",
    align: "left",
    format: (date: number) => formatDate(date, "DD/MM/YYYY[ - ]hh:mm"),
  },
  {
    label: t("manageUsers.booksMovementsDialog.solution"),
    field: "solution",
    name: "solution",
    align: "left",
  },
  {
    label: t("manageUsers.booksMovementsDialog.resolvedBy"),
    field: "resolvedBy",
    name: "resolved-by",
    align: "left",
    format: (resolver?: UserSummaryFragment) =>
      resolver ? `${resolver.firstname} ${resolver.lastname}` : "",
  },
]);
</script>
