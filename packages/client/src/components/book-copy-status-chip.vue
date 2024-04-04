<template>
  <q-icon v-bind="IconData[value]" class="q-mr-md" size="24px" />
  <span>
    {{ t(`warehouse.bookCopyStatus.${value}`) }}
  </span>
</template>

<script setup lang="ts">
import {
  mdiCancel,
  mdiCheckCircle,
  mdiClipboardArrowLeft,
  mdiCreditCardOutline,
  mdiGift,
  mdiHelpCircle,
  mdiPuzzle,
} from "@quasar/extras/mdi-v7";
import { NamedColor } from "quasar";
import { useI18n } from "vue-i18n";
import { BookCopyStatus } from "src/models/book";

const { t } = useI18n();

defineProps<{ value: BookCopyStatus }>();

const IconData: Record<BookCopyStatus, { color: NamedColor; name: string }> = {
  "not-available": {
    color: "negative",
    name: mdiCancel,
  },
  available: {
    color: "positive",
    name: mdiCheckCircle,
  },
  donated: {
    color: "primary",
    name: mdiGift,
  },
  incomplete: {
    color: "primary",
    name: mdiPuzzle,
  },
  lost: {
    color: "primary",
    name: mdiHelpCircle,
  },
  returned: {
    color: "primary",
    name: mdiClipboardArrowLeft,
  },
  sold: {
    color: "primary",
    name: mdiCreditCardOutline,
  },
};
</script>
