<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :title="t('manageUsers.receiptsDialog.title', user)"
      size="md"
      @cancel="onDialogCancel"
    >
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
        <receipts-table
          :no-data-label="$t('manageUsers.receiptsDialog.noSettlement')"
          :receipts="settlementReceipts"
          class="flex-grow"
          type="SETTLEMENT"
        />
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGetReceiptsQuery } from "src/services/receipt.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import { UserFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import ReceiptsTable from "./receipts-table.vue";

const props = defineProps<{
  user: UserFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { t } = useI18n();

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
const settlementReceipts = computed(() =>
  receipts.value.filter(({ type }) => type === "SETTLEMENT"),
);
</script>
