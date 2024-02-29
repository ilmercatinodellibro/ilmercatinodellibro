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
    <template #body-cell-link="{ value, row }">
      <q-td class="text-left width-200">
        <span class="cursor-pointer text-underline" @click="openReceipt(value)">
          {{ row.timestamp }}
        </span>
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
import { QTableColumn } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Receipt } from "src/models/receipts";
import ChipButton from "./chip-button.vue";

const { t } = useI18n();

type ReceiptType = "requests" | "retrievals" | "purchases";

const props = defineProps<{
  receipts: Receipt[];
  type: ReceiptType;
}>();

const columns = computed<QTableColumn<Receipt>[]>(() => [
  {
    label: t(`manageUsers.receiptsDialog.${props.type}`),
    field: "link",
    name: "link",
    align: "left",
  },
  {
    label:
      props.type === "requests"
        ? ""
        : t("manageUsers.receiptsDialog.createdBy"),
    field: "createdBy",
    name: "created-by",
    align: "left",
    classes: "ellipsis max-width-200",
  },
  {
    label: "",
    field: "link",
    name: "resend",
    align: "center",
  },
]);

function sendAgain(receipt: Receipt) {
  // FIXME: send receipt again
  receipt;
}

function openReceipt(link: string) {
  // FIXME: open receipt from link
  link;
}
</script>
