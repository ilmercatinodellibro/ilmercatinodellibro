<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <!--
      I didn't use k-dialog-card because it didn't
      have any width that satisfies this dialog's
    -->
    <q-card class="column max-height-600 max-height-fullscreen no-wrap">
      <q-card-section class="text-h6 text-primary">
        {{ $t("manageUsers.receiptsDialog.title") }}
      </q-card-section>
      <q-separator />
      <q-card-section
        class="col column flex-delegate-height-management no-wrap q-pa-none"
      >
        <receipts-table :receipts="requestReceipts" type="requests" />
        <receipts-table :receipts="retrievalReceipts" type="retrievals" />
        <receipts-table :receipts="purchaseReceipts" type="purchases" />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn :label="$t('common.close')" flat @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { Receipt } from "src/models/receipts";
import { UserFragment } from "src/services/user.graphql";
import ReceiptsTable from "./receipts-table.vue";

defineProps<{
  // eslint-disable-next-line vue/no-unused-properties
  user: UserFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const requestReceipts = ref<Receipt[]>([
  {
    link: "link",
    timestamp: "00-00-00 00:00",
  },
  {
    link: "link",
    timestamp: "01-00-00 00:00",
  },
  {
    link: "link",
    timestamp: "02-00-00 00:00",
  },
  {
    link: "link",
    timestamp: "03-00-00 00:00",
  },
  {
    link: "link",
    timestamp: "44-44-44 44:44",
  },
  {
    link: "link",
    timestamp: "05-00-00 00:00",
  },
]);
const retrievalReceipts = ref<Receipt[]>([
  {
    link: "link",
    timestamp: "06-00-00 00:00",
    createdBy: "Handy Manny",
  },
]);
const purchaseReceipts = ref<Receipt[]>([
  {
    link: "link",
    timestamp: "07-00-00 00:00",
    createdBy: "The Hitchhiker's Guide to the Galaxy",
  },
]);
</script>

<style scoped lang="scss">
$dialog-margin: 24px;

// TODO: remove when card height is standardized
.max-height-fullscreen {
  max-height: calc(100vh - #{$dialog-margin} * 2) !important;
}
</style>
