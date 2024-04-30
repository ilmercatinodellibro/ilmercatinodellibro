<template>
  <q-icon v-bind="IconData[getStatus(bookCopy)]" class="q-mr-md" size="24px" />
  <span>
    {{ t(`warehouse.bookCopyStatus.${getStatus(bookCopy)}`) }}
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
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";

const { t } = useI18n();

defineProps<{ bookCopy: BookCopyDetailsFragment }>();

type Status =
  | "not-available"
  | "available"
  | "donated"
  | "incomplete"
  | "lost"
  | "returned"
  | "sold";

function getStatus(bookCopy: BookCopyDetailsFragment): Status {
  return bookCopy.returnedAt ? "returned" : "available";
}

const IconData: Record<Status, { color: NamedColor; name: string }> = {
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
