<template>
  <chip-button
    :color="hasProblem(bookCopy) ? 'positive' : 'negative'"
    :label="
      t(
        `manageUsers.booksMovementsDialog.${hasProblem(bookCopy) ? 'solveProblem' : 'reportProblem'}`,
      )
    "
    @click="openProblemsDialog"
  />
</template>

<script setup lang="ts">
import { Dialog } from "quasar";
import { useI18n } from "vue-i18n";
import { getCurrentActiveProblem, hasProblem } from "src/helpers/book-copy";
import { notifyError } from "src/helpers/error-messages";
import {
  BookCopyDetailsFragment,
  ProblemSummaryFragment,
  useGetBookCopiesQuery,
  useReportProblemMutation,
  useResolveProblemMutation,
} from "src/services/book-copy.graphql";
import ChipButton from "./manage-users/chip-button.vue";
import ProblemsDialog from "./manage-users/problems-dialog.vue";

const { t } = useI18n();

const props = defineProps<{
  bookCopy: BookCopyDetailsFragment;
}>();

const emit = defineEmits<{
  updateProblems: [];
}>();

const { resolveProblem } = useResolveProblemMutation();
const { refetch: refetchBookCopies } = useGetBookCopiesQuery({
  bookId: props.bookCopy.book.id,
});
const { reportProblem } = useReportProblemMutation();
function openProblemsDialog() {
  Dialog.create({
    component: ProblemsDialog,
    componentProps: {
      bookCopy: props.bookCopy,
    },
  }).onOk(async ({ solution, details, type }: ProblemSummaryFragment) => {
    if (hasProblem(props.bookCopy)) {
      try {
        await resolveProblem({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          input: { id: getCurrentActiveProblem(props.bookCopy)!.id, solution },
        });

        await refetchBookCopies();

        emit("updateProblems");
      } catch (e) {
        notifyError(t("bookErrors.notSolveProblem"));
      }
      return;
    }

    try {
      await reportProblem({
        input: {
          bookCopyId: props.bookCopy.id,
          details,
          type,
        },
      });

      await refetchBookCopies({
        bookId: props.bookCopy.book.id,
      });

      emit("updateProblems");
    } catch (e) {
      notifyError(t("bookErrors.notProblem"));
    }
  });
}
</script>
