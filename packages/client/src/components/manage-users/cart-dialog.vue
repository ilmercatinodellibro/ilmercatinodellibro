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
            :model-value="cartBooks.length"
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
        :rows="cartBooks"
        :rows-per-page-options="[0]"
        class="flex-delegate-height-management"
        row-key="id"
      >
        <template #body="bodyProps">
          <q-tr>
            <q-td auto-width>
              <q-btn
                :icon="!bodyProps.expand ? mdiChevronUp : mdiChevronDown"
                flat
                round
                @click="bodyProps.expand = !bodyProps.expand"
              />
            </q-td>
            <q-td v-for="{ name, value } in bodyProps.cols" :key="name">
              <q-btn
                v-if="name === 'delete'"
                :icon="mdiDelete"
                color="negative"
                flat
                round
                @click="removeBook(bodyProps.row)"
              />
              <span v-else>
                {{ value }}
              </span>
            </q-td>
          </q-tr>
          <q-tr v-show="!bodyProps.expand">
            <q-th />
            <q-th class="height-48 text-left">
              {{ $t("book.code") }}
            </q-th>
          </q-tr>
          <q-tr
            v-for="(bookCopy, index) in bodyProps.row.copies"
            v-show="!bodyProps.expand"
            :key="bookCopy.id"
            :class="{
              'border-bottom-width-0':
                index !== bodyProps.row.copies.length - 1,
            }"
          >
            <q-td auto-width>
              <!--
                We set the props.expand prop to true to hide the
                row, because the v-show model is !props.expand
              -->
              <q-radio
                v-model="selectedBookCopies[bodyProps.row.id]"
                :val="bookCopy.id"
                @click="bodyProps.expand = true"
              />
            </q-td>
            <q-td colspan="100%">
              {{ bookCopy.code }}
            </q-td>
          </q-tr>
        </template>
      </dialog-table>

      <template #card-actions>
        <q-btn
          :label="$t('manageUsers.cartDialog.emptyCart')"
          color="negative"
          @click="emptyAndDestroyCart"
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
import { sumBy } from "lodash-es";
import {
  Dialog,
  Notify,
  QDialog,
  QTableColumn,
  date,
  useDialogPluginComponent,
} from "quasar";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { BookSummaryFragment } from "src/services/book.graphql";
import { useCartService } from "src/services/cart";
import { CustomerFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import CardTableHeader from "./card-table-header.vue";
import DialogTable from "./dialog-table.vue";
// import { useBookCopyService } from "src/services/book-copy";

const props = defineProps<{
  retailLocationId: string;
  user: CustomerFragment;
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

const cartBooks = ref<BookSummaryFragment[]>([]);
const cartId = ref<string>();

const {
  /* useAddToCartMutation, */ CART_EXPIRY_IN_SECONDS,
  useDeleteCartMutation,
  useOpenCartMutation,
} = useCartService();
// const { useGetBookCopiesQuery } = useBookCopyService();
// const { query: getBookCopiesQuery,  } = useGetBookCopiesQuery();

// const booksWithCopies = ref<BookSummaryFragment[]>([]);

const selectedBookCopies = ref<Record<string, number>>({});

const discountValue = computed(() =>
  // FIXME: add actual discount calculation logic
  props.user.discount ? "1.00" : "0.00",
);

const emptyCartTimer = ref(30 * 60);
const timeUntilEmpty = computed(() => {
  return date.formatDate(new Date(0).setSeconds(emptyCartTimer.value), "mm:ss");
});

const totalBooksPrice = computed(() =>
  sumBy(Object.keys(selectedBookCopies.value), (bookId) => {
    const book = cartBooks.value.find(({ id }) => id === bookId);
    return book?.originalPrice ?? 0;
  }).toFixed(2),
);

let interval: number | undefined;

const { openCart, loading } = useOpenCartMutation();
onMounted(async () => {
  const cart = await openCart({
    input: {
      retailLocationId: props.retailLocationId,
      userId: props.user.id,
    },
  });
  cartBooks.value = cart.data.books;
  cartId.value = cart.data.id;

  const cartExpiryInSeconds = Math.round(
    cart.data.createdAt / 1000 + CART_EXPIRY_IN_SECONDS - Date.now() / 1000,
  );
  emptyCartTimer.value = cartExpiryInSeconds;

  interval = window.setInterval(() => {
    if (emptyCartTimer.value === 0) {
      window.clearInterval(interval);
      // The server automatically deletes outdated carts, the cart component only closes itself
      onDialogHide();
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

const { deleteCart } = useDeleteCartMutation();
function emptyAndDestroyCart() {
  Dialog.create({
    title: "Svuotare carrello?",
    message:
      "Vuoi davvero svuotare il carrello del cliente attuale e ritornare i suoi libri tra le liste dei prenotati e dei richiesti?",
    cancel: "Annulla",
    ok: "Svuota",
  }).onOk(async () => {
    // Should never happen, check is for precaution
    if (!cartId.value) {
      return;
    }

    try {
      await deleteCart({
        input: {
          cartId: cartId.value,
        },
      });
    } catch {
      Notify.create({
        type: "negative",
        message:
          "Non è stato possibile eliminare il carrello per il cliente selezionato.",
      });
    } finally {
      onDialogHide();
    }
  });
}
</script>

<style scoped lang="scss">
.border-bottom-width-0 > td {
  border-bottom-width: 0 !important;
}
</style>
