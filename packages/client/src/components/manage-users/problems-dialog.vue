<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="title"
      size="sm"
      @cancel="onDialogCancel"
      @submit="onDialogOK(problemsData)"
    >
      <q-card-section v-if="!hasProblem" class="column gap-16">
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
import KDialogFormCard from "src/components/k-dialog-form-card.vue";
import { hasProblem as hasProblemFn } from "src/helpers/book-copy";
import { requiredRule } from "src/helpers/rules";
import {
  BookCopyDetailsFragment,
  ProblemSummaryFragment,
} from "src/services/book-copy.graphql";

const props = defineProps<{
  bookCopy: BookCopyDetailsFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
  useDialogPluginComponent<ProblemSummaryFragment>();

const options: ProblemType[] = ["LOST", "INCOMPLETE", "CUSTOM"];

const { t } = useI18n();

const hasProblem = computed(() => hasProblemFn(props.bookCopy));

const title = computed(() =>
  t(
    `manageUsers.booksMovementsDialog.${
      hasProblem.value ? "solveProblem" : "reportProblem"
    }`,
  ),
);

const problemsData = ref<ProblemSummaryFragment>({
  type: "LOST",
  details: "",
});
</script>
