<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :title="
        $t('manageUsers.cartDialog.title', [
          `${user.firstname} ${user.lastname}`,
        ])
      "
      size="fullscreen"
    >
      <card-table-header>
        <template #side-actions>
          <q-input
            :model-value="rows.length"
            :label="$t('manageUsers.cartDialog.totalBooks')"
            disable
            outlined
            readonly
          />
          <q-input
            :model-value="discountValue"
            :label="$t('manageUsers.cartDialog.discount')"
            disable
            outlined
            readonly
            suffix="€"
          />
          <q-input
            :model-value="totalBooksPrice"
            :label="$t('manageUsers.cartDialog.total')"
            disable
            outlined
            readonly
            suffix="€"
          />
        </template>
      </card-table-header>

      <dialog-table
        :columns="columns"
        :loading="loading"
        :rows="stubRows"
        :rows-per-page-options="[0]"
        class="flex-delegate-height-management"
        row-key="id"
      >
        <template #body="props">
          <q-tr>
            <q-td auto-width>
              <q-btn
                :icon="!props.expand ? mdiChevronUp : mdiChevronDown"
                flat
                round
                @click="props.expand = !props.expand"
              />
            </q-td>
            <q-td v-for="{ name, value } in props.cols" :key="name">
              <q-btn
                v-if="name === 'delete'"
                :icon="mdiDelete"
                color="negative"
                flat
                round
                @click="removeBook(props.row)"
              />
              <span v-else>
                {{ value }}
              </span>
            </q-td>
          </q-tr>
          <q-tr v-show="!props.expand">
            <q-th />
            <q-th class="height-48 text-left">
              {{ $t("book.code") }}
            </q-th>
          </q-tr>
          <q-tr
            v-for="(bookCopy, index) in props.row.bookCopies"
            v-show="!props.expand"
            :key="bookCopy"
            :class="{
              'border-bottom-width-0':
                index !== props.row.bookCopies.length - 1,
            }"
          >
            <q-td auto-width>
              <!--
                We set the props.expand prop to true to hide the
                row, because the v-show model is !props.expand
              -->
              <q-radio
                v-model="selectedBookCopies[props.row.id]"
                :val="index"
                @click="props.expand = true"
              />
            </q-td>
            <q-td colspan="100%">
              {{ bookCopy.code /* FIXME: add actual field */ }}
            </q-td>
          </q-tr>
        </template>
      </dialog-table>

      <template #card-actions>
        <q-btn
          :label="$t('manageUsers.cartDialog.emptyCart')"
          color="negative"
          @click="onDialogOK('empty-cart')"
        />
        <q-icon
          :name="mdiInformationOutline"
          class="q-pl-md q-pr-sm"
          color="black-87"
          size="24px"
        />
        {{ $t("manageUsers.cartDialog.autoEmptyDisclaimer", [timeUntilEmpty]) }}
        <q-space />
        <q-btn :label="$t('common.cancel')" flat @click="onDialogCancel()" />
        <q-btn
          :label="$t('manageUsers.cartDialog.sellBooks', [totalBooksPrice])"
          color="positive"
          @click="onDialogOK('sell-books')"
        />
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDelete,
  mdiInformationOutline,
} from "@quasar/extras/mdi-v7";
import { QDialog, QTableColumn, date, useDialogPluginComponent } from "quasar";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";
import { UserFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import CardTableHeader from "./card-table-header.vue";
import DialogTable from "./dialog-table.vue";

const properties = defineProps<{
  user: UserFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent<"empty-cart" | "sell-books">();

const { t } = useI18n();

const columns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    name: "selection",
    field: () => undefined,
    label: "",
  },
  {
    name: "isbn-code",
    field: "isbnCode",
    label: t("book.fields.isbn"),
    align: "left",
  },
  {
    name: "author",
    field: "authorsFullName",
    label: t("book.fields.author"),
    align: "left",
  },
  {
    name: "publisher",
    field: "publisherName",
    label: t("book.fields.publisher"),
    align: "left",
  },
  {
    name: "subject",
    field: "subject",
    label: t("book.fields.subject"),
    align: "left",
  },
  {
    name: "title",
    field: "title",
    label: t("book.fields.title"),
    align: "left",
  },
  {
    name: "cover-price",
    field: "originalPrice",
    label: t("book.fields.price"),
    align: "left",
    format: (val: number) => `${val.toFixed(2)} €`,
  },
  {
    name: "buy-price",
    // FIXME: add field and enable format
    field: () => undefined,
    label: t("manageUsers.payOffUserDialog.buyPrice"),
    align: "left",
    // format: (val: number) => `${val.toFixed(2)} €`,
  },
  {
    name: "public-price",
    // FIXME: add field and enable format
    field: () => undefined,
    label: t("manageUsers.payOffUserDialog.publicPrice"),
    align: "left",
    // format: (val: number) => `${val.toFixed(2)} €`,
  },
  {
    name: "delete",
    field: () => undefined,
    label: "",
  },
]);

// TODO: remove the pagination from here when correct query get connected.
const currentPage = ref(0);
const numberOfRows = ref(10);

const { refetchBooks, loading } = useBookService(currentPage, numberOfRows);

const rows = ref<BookSummaryFragment[]>([]);

const stubRows = computed(() =>
  rows.value.map((row, index) => ({
    ...row,
    bookCopies: [
      {
        code: `000/00${index + 1}`,
      },
      {
        code: `000/00${index + 2}`,
      },
    ],
  })),
);

const selectedBookCopies = ref<Record<string, number>>({});

const discountValue = computed(() =>
  // FIXME: add actual discount calculation logic
  properties.user.discount ? "1.00" : "0.00",
);

// FIXME: add the correct time to cart reset
const emptyCartTimer = ref(30 * 60);

const timeUntilEmpty = computed(() => {
  return date.formatDate(new Date(0).setSeconds(emptyCartTimer.value), "mm:ss");
});

const totalBooksPrice = computed(() =>
  Object.keys(selectedBookCopies.value)
    .reduce(
      (accumulator, currentValue) =>
        accumulator +
        (stubRows.value.find((value) => value.id === currentValue)
          ?.originalPrice ?? 0),
      0,
    )
    .toFixed(2),
);

let interval: number | undefined;

onMounted(async () => {
  const books = await refetchBooks({
    page: currentPage.value,
    rows: numberOfRows.value,
  });

  rows.value = books?.data.books.rows ?? [];

  interval = window.setInterval(() => {
    if (emptyCartTimer.value === 0) {
      window.clearInterval(interval);
      // FIXME: empty cart
    } else {
      emptyCartTimer.value--;
    }
  }, 1000);
});

onUnmounted(() => {
  window.clearInterval(interval);
});

function removeBook(book: BookSummaryFragment) {
  // FIXME: remove from cart and put into the previous state
  book;
}
</script>

<style scoped lang="scss">
.border-bottom-width-0 > td {
  border-bottom-width: 0 !important;
}
</style>
