<template>
  <q-icon
    v-if="!hideIcon"
    v-bind="IconData[getStatus()]"
    class="q-mr-md"
    size="24px"
  />
  <span>
    {{ t(`warehouse.bookCopyStatus.${getStatus()}`) }}
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
import { BookCopyStatus, getCurrentActiveProblem } from "src/helpers/book-copy";
import { BookCopyDetailsFragment } from "src/services/book-copy.graphql";

const { t } = useI18n();

const props = defineProps<{
  bookCopy: BookCopyDetailsFragment;
  hideIcon?: boolean;
}>();

function getStatus(): BookCopyStatus {
  const problemType = getCurrentActiveProblem(props.bookCopy)?.type;

  return props.bookCopy.returnedAt
    ? "returned"
    : problemType
      ? problemType !== "CUSTOM"
        ? problemType
        : "not-available"
      : props.bookCopy.purchasedAt
        ? "sold"
        : "available";
}

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
