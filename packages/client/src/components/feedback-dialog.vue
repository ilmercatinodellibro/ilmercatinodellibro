<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-form-card
      size="sm"
      :title="t('general.helpAndFeedback')"
      @submit="onSubmit"
    >
      <q-card-section>
        <q-select
          v-model="type"
          :rules="[requiredRule]"
          :options="REQUEST_TYPE_OPTIONS"
          :label="t('actions.selectFeedbackType')"
          outlined
          emit-value
          map-options
        />
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="message"
          :rules="[requiredRule]"
          :label="t('general.enterMessage')"
          lazy-rules
          outlined
          type="textarea"
        />
      </q-card-section>
      <template #card-actions="{ uniqueFormId }">
        <q-btn :label="t('common.cancel')" flat @click="onDialogCancel" />
        <q-btn
          :form="uniqueFormId"
          :label="t('common.confirm')"
          :loading="isLoading"
          flat
          type="submit"
        />
      </template>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Notify, useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { FeedbackType } from "src/@generated/graphql";
import { notifyError } from "src/helpers/error-messages";
import { requiredRule } from "src/helpers/rules";
import { ServerError } from "src/models/server";
import { useFeedbackMutation } from "src/services/feedback.graphql";
import KDialogFormCard from "./k-dialog-form-card.vue";

const { t } = useI18n();

const REQUEST_TYPE_OPTIONS = (
  ["FEATURE_IMPROVEMENT", "NEW_FEATURE", "BUG", "OTHER"] as FeedbackType[]
).map((type) => ({
  label: t(`feedbackType.${type}`),
  value: type,
}));

defineEmits(useDialogPluginComponent.emits);

const type = ref<FeedbackType>("FEATURE_IMPROVEMENT");
const message = ref("");

const { feedback, loading: isLoading } = useFeedbackMutation();

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

async function onSubmit() {
  try {
    await feedback({
      input: {
        type: type.value,
        message: message.value,
      },
    });
    Notify.create({
      message: t("general.feedbackRequestSent"),
      color: "positive",
    });
    onDialogOK();
  } catch (e) {
    const { message, status } = e as ServerError;

    // TODO: implement centralized error handling

    notifyError(message);

    if (![401, 422].includes(status)) {
      throw e;
    }
  }
}
</script>
