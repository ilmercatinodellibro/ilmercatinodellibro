<template>
  <q-dialog ref="dialogRef" :persistent="loading" @hide="onDialogHide">
    <k-dialog-card
      :title="
        $t('manageUsers.cartDialog.title', [
          `${user.firstname} ${user.lastname}`,
        ])
      "
      size="fullscreen"
    >
      <card-table-header @add-book="addBookToCart">
        <template #side-actions>
          <q-input
            :model-value="cartBooks.length"
            :label="$t('manageUsers.cartDialog.totalBooks')"
            disable
            outlined
          />
          <q-input
            :model-value="discountValue"
            :label="$t('manageUsers.cartDialog.discount')"
            disable
            outlined
            suffix="€"
          />
          <q-input
            :model-value="totalBooksPrice.toFixed(2)"
            :label="$t('manageUsers.cartDialog.total')"
            disable
            outlined
            suffix="€"
          />
        </template>
      </card-table-header>

      <dialog-table
        :columns="columns"
        :loading="loading"
        :rows="cartBooks"
        class="flex-delegate-height-management"
        row-key="id"
      >
        <template #body="bodyProps">
          <q-tr>
            <q-td
              v-for="{ name, value, classes } in bodyProps.cols"
              :key="name"
              :class="classes"
            >
              <q-btn
                v-if="name === 'selection'"
                :icon="!bodyProps.expand ? mdiChevronUp : mdiChevronDown"
                flat
                round
                @click="bodyProps.expand = !bodyProps.expand"
              />
              <q-btn
                v-if="name === 'delete'"
                :icon="mdiDelete"
                color="negative"
                flat
                round
                @click="removeBook(bodyProps.row)"
              />
              <span v-else>
                <q-tooltip v-if="['subject', 'author'].includes(name)">
                  {{ value }}
                </q-tooltip>
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
            <q-td colspan="11">
              {{ bookCopy.code }}
            </q-td>
          </q-tr>
        </template>
      </dialog-table>

      <template #card-actions>
        <q-btn
          :disable="cartBooks.length === 0"
          :label="$t('manageUsers.cartDialog.emptyCart')"
          color="negative"
          @click="emptyAndDestroyCart()"
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
          :disable="cartBooks.length === 0"
          :label="
            $t('manageUsers.cartDialog.sellBooks', [
              formatPrice(totalBooksPrice),
            ])
          "
          color="positive"
          @click="sellBooks()"
        />
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ApolloCache, isApolloError } from "@apollo/client";
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
import { evictQuery } from "src/apollo/cache";
import ConfirmDialog from "src/components/confirm-dialog.vue";
import { formatPrice } from "src/composables/use-misc-formats";
import { discountedPrice } from "src/helpers/book-copy";
import { notifyError } from "src/helpers/error-messages";
import { GetBookCopiesByOwnerDocument } from "src/services/book-copy.graphql";
import { BookSummaryFragment } from "src/services/book.graphql";
import { useCartService } from "src/services/cart";
import { BookWithAvailableCopiesFragment } from "src/services/cart.graphql";
import { GetRequestsDocument } from "src/services/request.graphql";
import { GetReservationsDocument } from "src/services/reservation.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import { CustomerFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import CardTableHeader from "./card-table-header.vue";
import DialogTable from "./dialog-table.vue";

const props = defineProps<{
  user: CustomerFragment;
}>();

const { selectedLocation: retailLocation } = useRetailLocationService();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

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
    classes: "max-width-160 ellipsis",
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
    classes: "max-width-160 ellipsis",
  },
  {
    name: "title",
    field: "title",
    label: t("book.fields.title"),
    align: "left",
    classes: "text-wrap",
  },
  {
    name: "cover-price",
    field: "originalPrice",
    label: t("book.fields.price"),
    align: "left",
    format: formatPrice,
  },
  {
    name: "buy-price",
    field: "originalPrice",
    label: t("manageUsers.payOffUserDialog.buyPrice"),
    align: "left",
    format: (val: number) => discountedPrice(val, "buy"),
  },
  {
    name: "public-price",
    field: "originalPrice",
    label: t("manageUsers.payOffUserDialog.publicPrice"),
    align: "left",
    format: (val: number) => discountedPrice(val, "sell"),
  },
  {
    name: "delete",
    field: () => undefined,
    label: "",
  },
]);

const cartBooks = ref<BookWithAvailableCopiesFragment[]>([]);
const selectedBookCopies = ref<Record<string, string>>({});
const cartId = ref<string>();

const emptyCartTimer = ref(30 * 60);
const timeUntilEmpty = computed(() => {
  return date.formatDate(new Date(0).setSeconds(emptyCartTimer.value), "mm:ss");
});

const discountValue = computed(() =>
  props.user.discount
    ? sumBy(
        cartBooks.value,
        ({ originalPrice }) =>
          (originalPrice * retailLocation.value.sellRate -
            originalPrice * retailLocation.value.buyRate) /
          100,
      )
    : 0,
);
const totalBooksPrice = computed(() =>
  sumBy(Object.keys(selectedBookCopies.value), (bookId) => {
    const book = cartBooks.value.find(({ id }) => id === bookId);
    if (!book) {
      return 0;
    }
    return (
      (book.originalPrice *
        (props.user.discount
          ? retailLocation.value.buyRate
          : retailLocation.value.sellRate)) /
      100
    );
  }),
);

const {
  CART_EXPIRY_IN_SECONDS,
  useAddToCartMutation,
  useDeleteCartMutation,
  useOpenCartMutation,
  useFinalizeCartMutation,
  useRemoveFromCartMutation,
} = useCartService();

let interval: number | undefined;
const { openCart, loading } = useOpenCartMutation();
onMounted(async () => {
  const { data: cart } = await openCart({
    input: {
      retailLocationId: retailLocation.value.id,
      userId: props.user.id,
    },
  });
  cartBooks.value = cart.books;
  cartId.value = cart.id;

  const cartExpiryInSeconds = Math.round(
    cart.createdAt / 1000 + CART_EXPIRY_IN_SECONDS - Date.now() / 1000,
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

const { addToCart, loading: addToCartLoading } = useAddToCartMutation();
async function addBookToCart(fromBookIsbn?: string) {
  if (!fromBookIsbn || !cartId.value || addToCartLoading.value) {
    return;
  }

  try {
    const { data } = await addToCart({
      input: {
        cartId: cartId.value,
        fromBookIsbn,
      },
    });

    cartBooks.value.push(data);
  } catch (_error) {
    const error = _error as Error;
    if (!isApolloError(error)) {
      notifyError(t("bookErrors.addBook"));
      return;
    }

    error.graphQLErrors.forEach((graphQLError) => {
      switch (graphQLError.message) {
        case "BOOK_NOT_FOUND":
          notifyError(t("bookErrors.noBook"));
          break;
        case "BOOK_NOT_AVAILABLE":
          notifyError(t("bookErrors.notInStock"));
          break;
        default:
          notifyError(t("bookErrors.addBook"));
      }
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evictRequestsReservationsQueries(cache: ApolloCache<any>) {
  evictQuery(cache, GetReservationsDocument, {
    retailLocationId: retailLocation.value.id,
    userId: props.user.id,
  });
  evictQuery(cache, GetRequestsDocument, {
    retailLocationId: retailLocation.value.id,
    userId: props.user.id,
  });
  cache.gc();
}

const { removeFromCart, loading: removeBookLoading } =
  useRemoveFromCartMutation();
async function removeBook(book: BookSummaryFragment) {
  const bookIndex = cartBooks.value.findIndex(({ id }) => book.id === id);

  // Avoid multiple deletions until the current one has ended
  if (bookIndex === -1 || !cartId.value || removeBookLoading.value) {
    return;
  }

  try {
    const { cache } = await removeFromCart({
      input: {
        bookId: book.id,
        cartId: cartId.value,
      },
    });
    cartBooks.value.splice(bookIndex, 1);

    // If the book had a selected copy, deletes that one too
    const currentlySelectedCopies = selectedBookCopies.value;
    if (currentlySelectedCopies[book.id]) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete currentlySelectedCopies[book.id];
      selectedBookCopies.value = currentlySelectedCopies;
    }

    evictRequestsReservationsQueries(cache);
  } catch {
    notifyError(t("bookErrors.notCartBookDeleted"));
  }
}

const { deleteCart } = useDeleteCartMutation();
function emptyAndDestroyCart() {
  Dialog.create({
    component: ConfirmDialog,
    componentProps: {
      title: t("manageUsers.cartDialog.empty.title"),
      message: t("manageUsers.cartDialog.empty.message"),
      ok: t("manageUsers.cartDialog.empty.emptyCart"),
      cancel: t("common.cancel"),
    },
  }).onOk(async () => {
    // Should never happen, check is for precaution
    if (!cartId.value) {
      return;
    }

    try {
      const { cache } = await deleteCart({
        input: {
          cartId: cartId.value,
        },
      });

      evictRequestsReservationsQueries(cache);
    } catch {
      notifyError(t("bookErrors.notCartDeleted"));
    } finally {
      onDialogHide();
    }
  });
}

const { finalizeCart } = useFinalizeCartMutation();
function sellBooks() {
  const bookAndCopies = Object.entries(selectedBookCopies.value);
  if (bookAndCopies.length < cartBooks.value.length) {
    notifyError(t("bookErrors.selectCopyAllBooks"));
    return;
  }

  Dialog.create({
    component: ConfirmDialog,
    componentProps: {
      title: t("manageUsers.cartDialog.confirm.title"),
      message: t("manageUsers.cartDialog.confirm.message", [
        formatPrice(totalBooksPrice.value),
      ]),
      ok: t("manageUsers.cartDialog.confirm.sell"),
      cancel: t("common.cancel"),
    },
  }).onOk(async () => {
    if (!cartId.value) {
      return;
    }

    try {
      loading.value = true;

      const { cache } = await finalizeCart({
        input: {
          cartId: cartId.value,
          bookCopyIds: bookAndCopies.map(
            ([, selectedBookCopyId]) => selectedBookCopyId,
          ),
        },
      });
      const ownersToUpdate = cartBooks.value.map(
        ({ copies }) =>
          copies?.find(
            ({ book, id }) => selectedBookCopies.value[book.id] === id,
          )?.owner,
      );
      ownersToUpdate.forEach((user) => {
        if (user) {
          evictQuery(cache, GetBookCopiesByOwnerDocument, {
            retailLocationId: retailLocation.value.id,
            userId: user.id,
          });
        }
      });

      evictRequestsReservationsQueries(cache);
    } catch {
      notifyError(t("bookErrors.notSell"));
    } finally {
      loading.value = false;

      Notify.create({
        type: "positive",
        message: "Libri venduti con successo.",
      });
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
