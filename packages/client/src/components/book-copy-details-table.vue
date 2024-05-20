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

    <q-tr v-for="bookCopy in filteredBookCopies" :key="bookCopy.id">
      <q-td auto-width />

      <q-td
        v-for="{ name, field, format } in bodyHeaderCols"
        :key="name"
        :auto-width="name === 'problems'"
        :colspan="getColspan(name)"
      >
        <template v-if="name === 'status'">
          <book-copy-status-chip :book-copy="bookCopy" />
        </template>

        <template v-else-if="name === 'problems'">
          <problems-button
            :book-copy="bookCopy"
            @update-problems="() => emit('updateProblems')"
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
import { isAvailable } from "src/helpers/book-copy";
import { getFieldValue } from "src/helpers/table-helpers";
import { useBookCopyService } from "src/services/book-copy";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";
import ProblemsButton from "./problems-button.vue";

const { t } = useI18n();

const props = defineProps<{
  bookCopyColumns: QTableColumn<BookCopyDetailsFragment>[];
  bookId: string;
  showOnlyAvailable?: boolean | null;
}>();

const emit = defineEmits<{
  openHistory: [bookCopy: BookCopyDetailsFragment];
  updateProblems: [];
}>();

const tableWidth = 9;

const bodyHeaderCols = computed<QTableColumn<BookCopyDetailsFragment>[]>(() => [
  {
    name: "code",
    field: "code",
    label: t("book.code"),
  },
  ...props.bookCopyColumns.filter(
    ({ name }) => !["isbn", "author", "subject", "title"].includes(name),
  ),
]);

const { useGetBookCopiesQuery } = useBookCopyService();

const { bookCopies, loading } = useGetBookCopiesQuery(() => ({
  bookId: props.bookId,
}));

const filteredBookCopies = computed(() =>
  props.showOnlyAvailable
    ? bookCopies.value.filter((copy) => isAvailable(copy))
    : bookCopies.value,
);

function getColspan(columnName: string) {
  return columnName === "original-code" || columnName === "status" ? 2 : 1;
}
</script>
