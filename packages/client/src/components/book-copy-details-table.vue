<template>
  <q-tr v-if="loading">
    <q-td :colspan="tableWidth" class="text-left">
      {{ t("general.loading") }}
    </q-td>
  </q-tr>

  <q-tr v-else-if="!bookCopies.length">
    <q-td :colspan="tableWidth" class="no-pointer-events text-left">
      {{ t("book.noResult") }}
    </q-td>
  </q-tr>

  <template v-else>
    <q-tr no-hover>
      <q-th auto-width />

      <q-th
        v-for="{ name, label } in bodyHeaderCols"
        :key="name"
        :colspan="getColspan(name)"
        class="height-48 text-left"
      >
        {{ label }}
      </q-th>
    </q-tr>

    <q-tr
      v-for="bookCopy in bookCopies as BookCopyDetailsWithStatus[]"
      :key="bookCopy.id"
    >
      <q-td auto-width />

      <q-td
        v-for="{ name, field, format } in bodyHeaderCols"
        :key="name"
        :auto-width="name === 'problems'"
        :colspan="getColspan(name)"
      >
        <template v-if="name === 'status'">
          <book-copy-status-chip
            :value="bookCopy.status ?? BookCopyStatuses.DONATED"
          />
        </template>

        <template v-else-if="name === 'problems'">
          <chip-button
            :color="hasProblem(bookCopy) ? 'positive' : 'negative'"
            :label="
              t(
                `manageUsers.booksMovementsDialog.${hasProblem(bookCopy) ? 'solveProblem' : 'reportProblem'}`,
              )
            "
            @click="emit('openProblemsDialog', bookCopy)"
          />
        </template>

        <template v-else-if="name === 'history'">
          <q-btn
            :icon="mdiHistory"
            color="primary"
            flat
            round
            @click="emit('openHistory', bookCopy)"
          />
        </template>

        <template v-else>
          {{
            format
              ? format(getFieldValue(field, bookCopy), bookCopy)
              : getFieldValue(field, bookCopy)
          }}
        </template>
      </q-td>
    </q-tr>
  </template>
</template>

<script setup lang="ts">
import { mdiHistory } from "@quasar/extras/mdi-v7";
import { QTableColumn } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BookCopyStatusChip from "src/components/book-copy-status-chip.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import { hasProblem } from "src/helpers/book-copy";
import { getFieldValue } from "src/helpers/table-helpers";
import { BookCopyDetailsWithStatus, BookCopyStatuses } from "src/models/book";
import { useBookCopyService } from "src/services/book-copy";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";

const { t } = useI18n();

const { bookId, bookCopyColumns } = defineProps<{
  bookCopyColumns: QTableColumn<BookCopyDetailsWithStatus>[];
  tableWidth: number;
  bookId: string;
}>();

const emit = defineEmits<{
  openProblemsDialog: [bookCopy: BookCopyDetailsFragment];
  openHistory: [bookCopy: BookCopyDetailsFragment];
}>();

const bodyHeaderCols = computed<QTableColumn<BookCopyDetailsWithStatus>[]>(
  () => [
    {
      name: "code",
      field: "code",
      label: t("book.code"),
    },
    ...bookCopyColumns.filter(({ name }) => name !== "isbn"),
  ],
);

const { useGetBookCopiesQuery } = useBookCopyService();

const { bookCopies, loading } = useGetBookCopiesQuery({
  bookId,
});

function getColspan(columnName: string) {
  return columnName === "original-code" || columnName === "status" ? 2 : 1;
}
</script>