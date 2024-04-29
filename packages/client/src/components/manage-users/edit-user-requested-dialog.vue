<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :cancel-label="$t('common.close')"
      :title="
        $t('manageUsers.requestedBooksDialog.title', [
          `${userData.firstname} ${userData.lastname}`,
        ])
      "
      size="fullscreen"
      @cancel="onDialogCancel"
    >
      <card-table-header @add-book="addBookToRequest">
        <template #side-actions>
          <!-- TODO: consider extracting this into a separate component -->
          <span v-if="screenWidth >= WidthSize.MD" class="gap-16 row">
            <q-btn
              :icon="mdiDelete"
              :label="$t('manageUsers.requestedBooksDialog.deleteAll')"
              color="negative"
              no-wrap
              @click="deleteAllRequested()"
            />
            <q-btn
              :label="$t('manageUsers.requestedBooksDialog.moveIntoReserved')"
              no-wrap
              outline
              @click="reserveAllAvailableRequested()"
            />
          </span>
          <span v-if="screenWidth === WidthSize.LG" class="gap-16 row">
            <q-btn
              :icon="mdiCartPlus"
              :label="$t('manageUsers.requestedBooksDialog.moveIntoCart')"
              color="primary"
              no-wrap
              @click="moveAllIntoCart()"
            />
            <q-btn
              :icon="mdiCart"
              :label="$t('manageUsers.goToCart')"
              no-wrap
              outline
              @click="goToCart()"
            >
              <round-badge
                :label="booksCartCount"
                color="accent"
                float-left-square
              />
            </q-btn>
          </span>
          <span v-else>
            <q-btn :icon="mdiDotsVertical" dense flat round>
              <q-menu auto-close>
                <span v-if="screenWidth === WidthSize.SM">
                  <q-item clickable @click="deleteAllRequested()">
                    <q-item-section>
                      {{ $t("manageUsers.requestedBooksDialog.deleteAll") }}
                    </q-item-section>
                  </q-item>
                  <q-item clickable @click="reserveAllAvailableRequested()">
                    <q-item-section>
                      {{
                        $t("manageUsers.requestedBooksDialog.moveIntoReserved")
                      }}
                    </q-item-section>
                  </q-item>
                </span>
                <q-item clickable @click="moveAllIntoCart()">
                  <q-item-section>
                    {{ $t("manageUsers.requestedBooksDialog.moveIntoCart") }}
                  </q-item-section>
                </q-item>
                <q-item clickable @click="goToCart()">
                  <q-item-section>
                    {{ $t("manageUsers.goToCart") }}
                  </q-item-section>
                </q-item>
              </q-menu>
            </q-btn>
          </span>
        </template>
      </card-table-header>
      <requested-reserved-table
        :loading="requestLoading"
        :rows="bookRequests"
        class="flex-delegate-height-management"
      >
        <template #book-actions="{ requestOrReservation: request }">
          <chip-button
            :label="$t('manageUsers.actions')"
            color="primary"
            show-dropdown
          >
            <template v-if="request.book.meta.isAvailable">
              <q-item v-close-popup clickable @click="reserveBook(request)">
                <q-item-section>
                  {{ $t("book.reservedBooksDialog.options.reserved") }}
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                @click="putRequestedBookIntoCart(request)"
              >
                <q-item-section>
                  {{ $t("book.reservedBooksDialog.options.cart") }}
                </q-item-section>
              </q-item>
            </template>

            <q-item v-close-popup clickable @click="deleteRequest(request)">
              <q-item-section>
                {{ $t("common.delete") }}
              </q-item-section>
            </q-item>
          </chip-button>
        </template>
      </requested-reserved-table>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {
  mdiCart,
  mdiCartPlus,
  mdiDelete,
  mdiDotsVertical,
} from "@quasar/extras/mdi-v7";
import { Dialog, Notify, QDialog, useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { notifyError } from "src/helpers/error-messages";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
import { fetchBookByISBN } from "src/services/book";
import { useCartService } from "src/services/cart";
import { useRequestService } from "src/services/request";
import { RequestSummaryFragment } from "src/services/request.graphql";
import { useReservationService } from "src/services/reservation";
import { CustomerFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import CardTableHeader from "./card-table-header.vue";
import CartDialog from "./cart-dialog.vue";
import ChipButton from "./chip-button.vue";
import RequestedReservedTable from "./requested-reserved-table.vue";
import RoundBadge from "./round-badge.vue";

const { t } = useI18n();

const smallBreakpoint = 1230;
const largeBreakpoint = 1695;
const screenWidth = useScreenWidth(smallBreakpoint, largeBreakpoint);

const props = defineProps<{
  userData: CustomerFragment;
  retailLocationId: string;
}>();
const booksCartCount = ref(props.userData.booksInCart);

defineEmits(useDialogPluginComponent.emitsObject);
const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

const {
  useGetRequestsQuery,
  useCreateRequestMutation,
  useDeleteRequestMutation,
} = useRequestService();
const {
  bookRequests,
  loading: requestLoading,
  refetch: refetchRequests,
} = useGetRequestsQuery({
  retailLocationId: props.retailLocationId,
  userId: props.userData.id,
});

const { createBookRequest } = useCreateRequestMutation();
async function addBookToRequest(bookIsbn: string) {
  const book = await fetchBookByISBN(bookIsbn);
  if (!book) {
    Dialog.create({
      message: t("manageUsers.inStockDialog.errorMessage"),
    });
    return;
  }

  try {
    await createBookRequest({
      input: { bookId: book.id, userId: props.userData.id },
    });
  } catch (e) {
    Notify.create(
      t("reserveBooks.reservationOrRequestError", [
        t("reserveBooks.request"),
        e,
      ]),
    );
  } finally {
    await refetchRequests();
  }
}

const { deleteBookRequest } = useDeleteRequestMutation();
async function deleteAllRequested() {
  try {
    await Promise.all(
      bookRequests.value.map(({ id }) => {
        return deleteBookRequest({
          input: {
            id,
          },
        });
      }),
    );
  } catch {
    notifyError("Non tutte le richieste sono state cancellate.");
  } finally {
    await refetchRequests();
  }
}
async function deleteRequest(request: RequestSummaryFragment) {
  try {
    await deleteBookRequest({
      input: {
        id: request.id,
      },
    });
  } catch {
    notifyError("Non è stato possibile cancellare la richiesta.");
  } finally {
    await refetchRequests();
  }
}

const { useCreateReservationsMutation } = useReservationService();
const { createReservations } = useCreateReservationsMutation();
async function reserveAllAvailableRequested() {
  const availableBookIds = bookRequests.value
    .filter(({ book }) => book.meta.isAvailable)
    .map(({ book }) => book.id);

  if (availableBookIds.length === 0) {
    return;
  }

  try {
    await createReservations({
      input: {
        userId: props.userData.id,
        retailLocationId: props.retailLocationId,
        bookIds: availableBookIds,
      },
    });

    Notify.create({
      type: "positive",
      // TODO: translate this one
      message: `Prenotato ${availableBookIds.length} copie di libri richiesti.`,
    });
  } catch {
    notifyError("Non è stato possibile prenotare tutte le richieste.");
  } finally {
    await refetchRequests();
  }
}
async function reserveBook({ book }: RequestSummaryFragment) {
  try {
    await createReservations({
      input: {
        userId: props.userData.id,
        retailLocationId: props.retailLocationId,
        bookIds: [book.id],
      },
    });

    Notify.create({
      type: "positive",
      // TODO: translate this one
      message: `Prenotato ${book.title}.`,
    });
  } catch {
    notifyError("Non è stato possibile prenotare il libro specificato.");
  } finally {
    await refetchRequests();
  }
}

const { useAddToCartMutation, useOpenCartMutation } = useCartService();
const { openCart } = useOpenCartMutation();
const { addToCart } = useAddToCartMutation();
async function moveAllIntoCart() {
  const availableBooksRequestIds = bookRequests.value
    .filter(({ book }) => book.meta.isAvailable)
    .map(({ id }) => id);

  if (availableBooksRequestIds.length === 0) {
    return;
  }

  try {
    const cart = await openCart({
      input: {
        retailLocationId: props.retailLocationId,
        userId: props.userData.id,
      },
    });

    await Promise.all(
      availableBooksRequestIds.map((id) => {
        return addToCart({
          input: {
            cartId: cart.data.id,
            fromBookRequestId: id,
          },
        });
      }),
    );

    booksCartCount.value += availableBooksRequestIds.length;
  } catch {
    notifyError("Non è stato possibile aggiungere tutti i libri al carrello.");
  } finally {
    await refetchRequests();
  }
}
async function putRequestedBookIntoCart(request: RequestSummaryFragment) {
  if (!request.book.meta.isAvailable) {
    return;
  }

  try {
    const cart = await openCart({
      input: {
        retailLocationId: props.retailLocationId,
        userId: props.userData.id,
      },
    });

    await addToCart({
      input: {
        cartId: cart.data.id,
        fromBookRequestId: request.id,
      },
    });

    booksCartCount.value++;
  } catch {
    notifyError("Non è stato possibile aggiungere il libro al carrello.");
  } finally {
    await refetchRequests();
  }
}

function goToCart() {
  Dialog.create({
    component: CartDialog,
    componentProps: {
      user: props.userData,
    },
  }).onOk((payload) => {
    // FIXME: add cart management logic
    payload;
  });
}
</script>
