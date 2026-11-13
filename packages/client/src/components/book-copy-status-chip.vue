<template>
  <q-icon
    v-if="!hideIcon"
    v-bind="IconData[displayStatus()]"
    class="q-mr-md"
    size="sm"
  />
  <span>
    {{ t(`warehouse.bookCopyStatus.${displayStatus()}`) }}
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
import type { NamedColor } from "quasar";
import { useI18n } from "vue-i18n";
import {
  type BookCopyStatus,
  getCurrentActiveProblem,
  getStatus,
} from "@/helpers/book-copy";
import type { BookCopyDetailsFragment } from "@/services/book-copy.graphql";

const props = defineProps<{
  bookCopy: BookCopyDetailsFragment;
  hideIcon?: boolean;
}>();

const { t } = useI18n();

function displayStatus(): Exclude<BookCopyStatus, "reimbursed" | "settled"> {
  const status = getStatus(props.bookCopy);
  const problemType = getCurrentActiveProblem(props.bookCopy)?.type;

  return status === "reimbursed"
    ? problemType
      ? problemType === "CUSTOM"
        ? "not-available"
        : problemType
      : "available"
    : status === "settled"
      ? "sold"
      : status;
}

const IconData: Record<
  Exclude<BookCopyStatus, "reimbursed" | "settled">,
  { color: NamedColor; name: string }
> = {
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
  INCOMPLETE: {
    color: "primary",
    name: mdiPuzzle,
  },
  LOST: {
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
