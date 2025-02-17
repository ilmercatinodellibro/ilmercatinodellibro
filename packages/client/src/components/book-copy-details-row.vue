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
      <!-- Fills in the chevron column -->
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
      v-for="bookCopy in filteredBookCopies"
      :key="bookCopy.id"
      :class="isMobile ? 'sticky-last-column' : ''"
    >
      <!-- Fills in the chevron column -->
      <q-td auto-width />

      <q-td
        v-for="{ align, classes, name, field, format } in bodyHeaderCols"
        :key="name"
        :auto-width="name === 'problems'"
        :class="[
          `text-${align ?? 'left'}`,
          classes,
          isMobile && name === 'history' ? 'no-padding' : '',
        ]"
        :colspan="getColspan(name)"
      >
        <template v-if="name === 'status'">
          <book-copy-status-chip :book-copy="bookCopy" />
        </template>

        <template v-else-if="name === 'problems'">
          <problems-button
            v-if="!isMobile"
            :book-copy="bookCopy"
            @update-problems="emit('updateProblems')"
          />
        </template>

        <template v-else-if="name === 'history'">
          <q-btn
            v-if="!isMobile"
            :icon="mdiHistory"
            color="primary"
            flat
            round
            @click="emit('openHistory', bookCopy)"
          />

          <q-btn
            v-else
            :icon="mdiDotsVertical"
            class="full-height"
            color="primary"
            flat
          >
            <q-menu>
              <q-list>
                <q-item
                  v-close-popup
                  clickable
                  @click="reportOrSolveProblem(bookCopy)"
                >
                  <q-item-section>
                    <q-item-label>
                      {{
                        t(
                          `manageUsers.booksMovementsDialog.${hasProblem(bookCopy) ? "solveProblem" : "reportProblem"}`,
                        )
                      }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
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
import { mdiDotsVertical, mdiHistory } from "@quasar/extras/mdi-v7";
import { QTableColumn } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BookCopyStatusChip from "src/components/book-copy-status-chip.vue";
import ProblemsButton from "src/components/problems-button.vue";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import {
  reportOrSolveProblem as _reportOrSolveProblem,
  hasProblem,
  isAvailable,
} from "src/helpers/book-copy";
import { getFieldValue } from "src/helpers/table-helpers";
import {
  BookCopyDetailsFragment,
  useGetBookCopiesQuery,
} from "src/services/book-copy.graphql";

const props = defineProps<{
  bookId: string;
  showOnlyAvailable?: boolean | null;
}>();

const emit = defineEmits<{
  openHistory: [bookCopy: BookCopyDetailsFragment];
  updateProblems: [];
}>();

const { t } = useI18n();

const { isMobile } = useLateralDrawer();

const tableWidth = 9;

const bodyHeaderCols = computed<QTableColumn<BookCopyDetailsFragment>[]>(() => [
  {
    name: "code",
    field: "code",
    label: t("book.code"),
  },
  {
    name: "original-code",
    field: "originalCode",
    label: t("book.originalCode"),
    format: (field?: string) => field ?? "/",
  },
  {
    name: "owner",
    field: ({ owner }) => owner.email,
    label: t("warehouse.owner"),
    align: "left",
  },
  {
    name: "status",
    field: () => undefined,
    label: t("book.fields.status"),
    align: "left",
  },
  {
    name: "problems",
    field: "problems",
    label: "",
    align: "center",
  },
  {
    name: "history",
    field: () => undefined,
    label: "",
  },
]);

const { bookCopies, loading } = useGetBookCopiesQuery(() => ({
  bookId: props.bookId,
}));

const filteredBookCopies = computed(() =>
  props.showOnlyAvailable
    ? bookCopies.value.filter((copy) => isAvailable(copy))
    : bookCopies.value,
);

function getColspan(columnName: string) {
  return ["owner", "status"].includes(columnName) ? 2 : 1;
}

async function reportOrSolveProblem(bookCopy: BookCopyDetailsFragment) {
  await _reportOrSolveProblem(bookCopy);
  emit("updateProblems");
}
</script>
