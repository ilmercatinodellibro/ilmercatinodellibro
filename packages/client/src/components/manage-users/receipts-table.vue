<template>
  <q-table
    :columns="columns"
    :rows="receipts"
    :rows-per-page-options="[0]"
    hide-bottom
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

    <template #body-cell-resend="{ value }">
      <q-td class="text-center width-0">
        <chip-button
          :label="$t('manageUsers.receiptsDialog.resend')"
          color="primary"
          @click="sendAgain(value)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { QTableColumn, date } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ReceiptType } from "src/@generated/graphql";
import { ReceiptFragment } from "src/services/receipt.graphql";
import ChipButton from "./chip-button.vue";

const { t } = useI18n();

const props = defineProps<{
  receipts: ReceiptFragment[];
  type: ReceiptType;
}>();

const { formatDate } = date;
const columns = computed<QTableColumn<ReceiptFragment>[]>(() => [
  {
    label: t(`manageUsers.receiptsDialog.type.${props.type}`),
    field: "createdAt",
    format: (date: number) => formatDate(date, "YYYY-MM-DD HH:mm:ss"),
    name: "timestamp",
    align: "left",
  },
  {
    label: /* props.type === "REQUEST"
        ? ""
        :  */ t("manageUsers.receiptsDialog.createdBy"),
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

function sendAgain(receipt: ReceiptFragment) {
  // FIXME: send receipt again
  receipt;
}

function openReceipt(receipt: ReceiptFragment) {
  // FIXME: open receipt from link
  receipt;
}
</script>
