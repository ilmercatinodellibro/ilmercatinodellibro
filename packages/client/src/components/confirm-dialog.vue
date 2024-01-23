<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :cancel-label="cancel"
      :save-label="ok"
      :title="title"
      show-save-button
      size="sm"
      @save="onDialogOK"
      @cancel="onDialogCancel"
    >
      <q-card-section>{{ message }}</q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from "quasar";
import { defineComponent } from "vue";
import { useI18nOutsideSetup } from "src/boot/i18n";
import KDialogCard from "./k-dialog-card.vue";

const { t } = useI18nOutsideSetup();

export default defineComponent({
  name: "ConfirmDialog",
  components: { KDialogCard },
  props: {
    cancel: {
      type: String,
      default: t("common.cancel"),
    },
    message: {
      type: String,
      required: true,
    },
    ok: {
      type: String,
      default: t("common.confirm"),
    },
    title: {
      type: String,
      default: t("general.confirmRequest"),
    },
  },
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  emits: useDialogPluginComponent.emitsObject,
  setup() {
    return {
      ...useDialogPluginComponent(),
    };
  },
});
</script>
