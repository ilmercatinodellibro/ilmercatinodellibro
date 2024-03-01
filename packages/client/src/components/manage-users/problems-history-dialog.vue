<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :cancel-label="$t('common.close')"
      :title="$t('manageUsers.booksMovementsDialog.problemsHistory')"
      @cancel="onDialogCancel"
    >
      <q-card-section
        class="column flex-delegate-height-management full-height q-pa-none"
      >
        <dialog-table
          :columns="columns"
          :loading="loading"
          :rows="rows"
          :pagination="pagination"
          hide-bottom
          @request="onRequest"
        />
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {
  QTableColumn,
  QTableProps,
  date,
  useDialogPluginComponent,
} from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { BookCopy, ProblemType } from "src/@generated/graphql";
import { ProblemDetailsFragment } from "src/services/book-copy.graphql";
import { UserSummaryFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import DialogTable from "./dialog-table.vue";

defineProps<{
  // eslint-disable-next-line vue/no-unused-properties
  bookCopy: BookCopy;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const { formatDate } = date;

const { t } = useI18n();

const loading = ref(false);

const rows = ref<ProblemDetailsFragment[]>([]);

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
    format: (resolver: UserSummaryFragment) =>
      `${resolver.firstname} ${resolver.lastname}`,
  },
]);

const page = ref(0);
const rowsNumber = ref(8);

const pagination = ref({
  page: page.value,
  rowsNumber: rowsNumber.value,
  rowsPerPage: 0,
});

const onRequest: QTableProps["onRequest"] = ({
  pagination: requestPagination,
}) => {
  loading.value = true;

  // FIXME: add actual query logic
  rows.value = [];
  for (let i = 0; i < 8; i++) {
    rows.value.push({
      id: i.toString(),
      createdAt: new Date(
        Math.pow(10, 12) * parseFloat(Math.random().toFixed(12)),
      ).getDate(),
      type: "CUSTOM",
      details: "Found dead",
      createdBy: {
        email: "email@example.com",
        firstname: "Paolo",
        id: "0",
        lastname: "Caleffi",
      },
      updatedAt: Date.now(),
      resolvedAt: new Date(
        Math.pow(10, 12) * parseFloat(Math.random().toFixed(12)),
      ).getDate(),
      resolvedBy: {
        email: "email@example.com",
        firstname: "Paolo",
        id: "0",
        lastname: "Caleffi",
      },
      solution: "Books are always dead",
    });
  }

  pagination.value.rowsNumber = 8;
  pagination.value.page = requestPagination.page;
  pagination.value.rowsPerPage = requestPagination.rowsPerPage;

  loading.value = false;
};
</script>
