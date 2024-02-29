<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="title"
      size="sm"
      @cancel="onDialogCancel"
      @submit="onDialogOK(problemsData)"
    >
      <q-card-section v-if="activeProblem" class="column gap-16">
        <q-select
          v-model="problemsData.type"
          :label="$t('manageUsers.booksMovementsDialog.problemType')"
          :options="options"
          :rules="[requiredRule]"
          outlined
        >
          <template #selected>
            {{
              $t(
                `manageUsers.booksMovementsDialog.problemTypes.${problemsData.type}`,
              )
            }}
          </template>
          <template #option="{ itemProps, opt, toggleOption }">
            <q-item :props="itemProps" clickable @click="toggleOption(opt)">
              <q-item-section>
                {{ $t(`manageUsers.booksMovementsDialog.problemTypes.${opt}`) }}
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          v-model="problemsData.details"
          :label="$t('manageUsers.booksMovementsDialog.details')"
          :rules="[requiredRule]"
          outlined
          type="textarea"
        />
      </q-card-section>
      <q-card-section v-else class="column gap-16">
        <q-input
          v-model="problemsData.solution"
          :label="$t('manageUsers.booksMovementsDialog.howResolved')"
          :rules="[requiredRule]"
          outlined
          type="textarea"
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ProblemType } from "src/@generated/graphql";
import { requiredRule } from "src/helpers/rules";
import {
  BookCopyDetailsFragment,
  ProblemDetailsFragment,
} from "src/services/book-copy.graphql";
import { UserSummaryFragment } from "src/services/user.graphql";
import KDialogFormCard from "../k-dialog-form-card.vue";

const props = defineProps<{
  bookCopy: BookCopyDetailsFragment;
  user: UserSummaryFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
  useDialogPluginComponent<ProblemDetailsFragment | undefined>();

const options: ProblemType[] = ["LOST", "INCOMPLETE", "CUSTOM"];

const { t } = useI18n();

const title = computed(() =>
  t(
    `manageUsers.booksMovementsDialog.${
      props.bookCopy.problems
        ? latestProblem
          ? "solveProblem"
          : "reportProblem"
        : "reportProblem"
    }`,
  ),
);

const latestProblem = props.bookCopy.problems
  ? props.bookCopy.problems[props.bookCopy.problems.length - 1] ?? undefined
  : undefined;

const activeProblem = computed(
  () => !(props.bookCopy.problems ? latestProblem?.resolvedAt : false),
);

// TODO: fix the current data stub with actual data
const problemsData = ref<ProblemDetailsFragment>({
  type: latestProblem?.type ?? "LOST",
  details: latestProblem?.details ?? "",
  createdAt: latestProblem?.createdAt ?? Date.now(),
  createdBy: latestProblem?.createdBy ?? props.user,
  resolvedAt: latestProblem?.resolvedAt,
  resolvedBy: latestProblem?.resolvedBy,
  solution: latestProblem?.solution,
  updatedAt: latestProblem?.updatedAt ?? Date.now(),
  id: latestProblem?.id ?? "0",
});
</script>
