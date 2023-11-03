<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-form-card
      :title="title"
      size="sm"
      :submit-label="ok"
      :cancel-label="cancel"
      @submit="onDialogOK(nameModel)"
      @cancel="onDialogCancel"
    >
      <q-card-section>
        <q-input
          v-model="nameModel"
          :rules="[requiredRule]"
          class="q-mt-md"
          :label="t('common.name')"
          lazy-rules="ondemand"
          outlined
        />
      </q-card-section>
    </k-dialog-form-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from "quasar";
import { defineComponent, ref } from "vue";
import { useI18nOutsideSetup } from "src/boot/i18n";
import { requiredRule } from "src/helpers/rules";
import KDialogFormCard from "./k-dialog-form-card.vue";

const { t } = useI18nOutsideSetup();
export default defineComponent({
  name: "EditNameDialog",
  components: { KDialogFormCard },
  props: {
    initialName: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: t("actions.editName"),
    },
    cancel: {
      type: String,
      default: t("common.cancel"),
    },
    ok: {
      type: String,
      default: t("common.save"),
    },
  },
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  emits: useDialogPluginComponent.emitsObject,
  setup(props) {
    // Models
    const nameModel = ref(props.initialName);

    return {
      ...useDialogPluginComponent(),
      nameModel,
      requiredRule,
      t,
    };
  },
});
</script>
