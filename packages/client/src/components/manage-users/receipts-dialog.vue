<template>
  <q-dialog
    ref="dialogRef"
    :full-height="isMobile"
    :maximized="isMobile"
    @hide="onDialogHide"
  >
    <!--
      I didn't use k-dialog-card because it didn't
      have any width that satisfies this dialog's
    -->
    <k-dialog-card
      :title="t('manageUsers.receiptsDialog.title')"
      class="full-width max-width-560"
      size="fullscreen"
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
      </q-card-section>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
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
const { isMobile } = useLateralDrawer();

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
