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
  hasProblem as hasProblemFn,
} from "src/helpers/book-copy";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";
import ChipButton from "./manage-users/chip-button.vue";

const { t } = useI18n();

const props = defineProps<{
  bookCopy: BookCopyDetailsFragment;
}>();

const emit = defineEmits<{
  updateProblems: [];
}>();

const hasProblem = computed(() => hasProblemFn(props.bookCopy));

async function reportOrSolveProblem() {
  await _reportOrSolveProblem(props.bookCopy);
  emit("updateProblems");
}
</script>
