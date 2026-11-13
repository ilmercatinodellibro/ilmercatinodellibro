<template>
  <chip-button
    :color="hasProblem ? 'positive' : 'negative'"
    :label="
      t(
        `manageUsers.booksMovementsDialog.${hasProblem ? 'solveProblem' : 'reportProblem'}`,
      )
    "
    @click="reportOrSolveProblem()"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  reportOrSolveProblem as _reportOrSolveProblem,
  hasProblem as hasProblemFunction,
} from "src/helpers/book-copy";
import type { BookCopyDetailsFragment } from "src/services/book-copy.graphql";
import ChipButton from "./manage-users/chip-button.vue";

const props = defineProps<{
  bookCopy: BookCopyDetailsFragment;
}>();

const emit = defineEmits<{
  updateProblems: [];
}>();

const { t } = useI18n();

const hasProblem = computed(() => hasProblemFunction(props.bookCopy));

async function reportOrSolveProblem() {
  await _reportOrSolveProblem(props.bookCopy);
  emit("updateProblems");
}
</script>
