<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <!--
      I didn't use k-dialog-card because it didn't
      have any width that satisfies this dialog's
    -->
    <q-card
      class="column max-height-600 max-height-fullscreen min-height-400 min-width-420 no-wrap"
    >
      <q-card-section class="text-h6 text-primary">
        {{ $t("manageUsers.receiptsDialog.title") }}
      </q-card-section>
      <q-separator />
      <q-card-section
        class="col column flex-delegate-height-management no-wrap q-pa-none"
      >
        <receipts-table
          :no-data-label="$t('manageUsers.receiptsDialog.noWithdrawal')"
          :receipts="withdrawalReceipts"
          class="flex-grow"
          type="WITHDRAWAL"
        />
        <receipts-table
          :no-data-label="$t('manageUsers.receiptsDialog.noPurchase')"
          :receipts="purchaseReceipts"
          class="flex-grow"
          type="PURCHASE"
        />
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
import { computed } from "vue";
import { useGetReceiptsQuery } from "src/services/receipt.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import { UserFragment } from "src/services/user.graphql";
import ReceiptsTable from "./receipts-table.vue";

const props = defineProps<{
  user: UserFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const { selectedLocation } = useRetailLocationService();
const { receipts } = useGetReceiptsQuery(() => ({
  userId: props.user.id,
  retailLocationId: selectedLocation.value.id,
}));

const withdrawalReceipts = computed(() =>
  receipts.value.filter(({ type }) => type === "WITHDRAWAL"),
);
const purchaseReceipts = computed(() =>
  receipts.value.filter(({ type }) => type === "PURCHASE"),
);
</script>

<style scoped lang="scss">
$dialog-margin: 24px;

// TODO: remove when card height is standardized
.max-height-fullscreen {
  max-height: calc(100vh - #{$dialog-margin} * 2) !important;
}
</style>
