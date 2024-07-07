<template>
  <q-table
    :columns="columns"
    :rows="receipts"
    :hide-bottom="receipts.length > 0"
    :no-data-label="noDataLabel"
    :rows-per-page-options="[0]"
    square
  >
    <template #header-cell-created-by="{ col }">
      <q-th class="text-left">
        <span v-if="col.label !== ''">
          {{ col.label }}
        </span>
      </q-th>
    </template>

    <template #body-cell-timestamp="{ row, value }">
      <q-td class="text-left width-200">
        <q-btn
          class="text-underline text-weight-regular"
          :label="value"
          flat
          dense
          @click="openReceipt(row)"
        />
      </q-td>
    </template>

    <template #body-cell-resend="{ row }">
      <q-td class="text-center width-0">
        <chip-button
          :label="$t('manageUsers.receiptsDialog.resend')"
          color="primary"
          @click="sendAgain(row)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { Notify, QTableColumn, date } from "quasar";
import { computed, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ReceiptType } from "src/@generated/graphql";
import { useAuthService } from "src/services/auth";
import {
  ReceiptFragment,
  useResendReceiptMutation,
} from "src/services/receipt.graphql";
import ChipButton from "./chip-button.vue";

const { t } = useI18n();

const props = defineProps<{
  receipts: ReceiptFragment[];
  noDataLabel: string;
  type: ReceiptType;
}>();

const { formatDate } = date;
const columns = computed<QTableColumn<ReceiptFragment>[]>(() => [
  {
    label: t(`manageUsers.receiptsDialog.type.${props.type}`, 2),
    field: "createdAt",
    format: (date: number) => formatDate(date, "YYYY-MM-DD HH:mm:ss"),
    name: "timestamp",
    align: "left",
  },
  {
    label: t("manageUsers.receiptsDialog.createdBy"),
    field: ({ createdBy }) => `${createdBy.firstname} ${createdBy.lastname}`,
    name: "created-by",
    align: "left",
    classes: "ellipsis max-width-200",
  },
  {
    label: "",
    field: () => undefined,
    name: "resend",
    align: "center",
  },
]);

const { resendReceipt } = useResendReceiptMutation();
async function sendAgain(receipt: ReceiptFragment) {
  await resendReceipt({ input: { receiptId: receipt.id } });
  Notify.create({
    type: "positive",
    message: t("manageUsers.receiptsDialog.resendSuccess", {
      type: t(`manageUsers.receiptsDialog.type.${receipt.type}`).toLowerCase(),
    }),
  });
}

const { getJwtHeader } = useAuthService();

const objectUrls = new Map<string, string>();
onUnmounted(() => {
  for (const url of objectUrls.values()) {
    URL.revokeObjectURL(url);
  }
});
async function openReceipt(receipt: ReceiptFragment) {
  const headers = getJwtHeader();
  const response = await fetch(`/receipts/${receipt.id}`, { headers });
  const blob = await response.blob();

  const dataUrl = objectUrls.get(receipt.id) ?? URL.createObjectURL(blob);
  objectUrls.set(receipt.id, dataUrl);
  window.open(dataUrl, "_blank");
}
</script>
