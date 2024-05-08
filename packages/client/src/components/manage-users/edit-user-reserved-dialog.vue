<template>
  <q-dialog ref="dialogRef" full-height @hide="onDialogHide">
    <k-dialog-card
      size="fullscreen"
      :cancel-label="$t('common.close')"
      :title="
        $t('manageUsers.reservedBooksDialog.title', [
          `${userData.firstname} ${userData.lastname}`,
        ])
      "
      @cancel="onDialogCancel"
    >
      <card-table-header @add-book="addReservationFromIsbn">
        <template #side-actions>
          <!-- TODO: consider extracting this into a separate component -->
          <span v-if="screenWidth >= WidthSize.MD" class="gap-16 row">
            <q-btn
              :icon="mdiDelete"
              :label="$t('manageUsers.reservedBooksDialog.deleteAllReserved')"
              color="negative"
              no-wrap
              @click="deleteAllReserved()"
            />
            <q-btn
              :icon="mdiCartPlus"
              :label="$t('manageUsers.reservedBooksDialog.moveAllIntoCart')"
              color="primary"
              no-wrap
              @click="moveAllIntoCart()"
            />
          </span>
          <span v-if="screenWidth === WidthSize.LG" class="gap-16 row">
            <q-btn
              :icon="mdiCartPlus"
              :label="$t('manageUsers.reservedBooksDialog.reservedIntoCart')"
              no-wrap
              outline
              @click="moveReservedIntoCart()"
            />
            <q-btn
              :icon="mdiCart"
              :label="$t('manageUsers.goToCart')"
              no-wrap
              outline
              @click="onDialogOK()"
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
                  <q-item clickable @click="deleteAllReserved()">
                    <q-item-section>
                      {{
                        $t("manageUsers.reservedBooksDialog.deleteAllReserved")
                      }}
                    </q-item-section>
                  </q-item>
                  <q-item clickable @click="moveAllIntoCart()">
                    <q-item-section>
                      {{
                        $t("manageUsers.reservedBooksDialog.moveAllIntoCart")
                      }}
                    </q-item-section>
                  </q-item>
                </span>
                <q-item clickable @click="moveReservedIntoCart()">
                  <q-item-section>
                    {{ $t("manageUsers.reservedBooksDialog.reservedIntoCart") }}
                  </q-item-section>
                </q-item>
                <q-item clickable @click="onDialogOK()">
                  <q-item-section>
                    {{ $t("manageUsers.goToCart") }}
                  </q-item-section>
                </q-item>
              </q-menu>
            </q-btn>
          </span>
        </template>
      </card-table-header>

      <q-card-section
        class="col column flex-delegate-height-management no-wrap q-pa-none"
      >
        <requested-reserved-table
          :rows="userReservations"
          class="col"
          :loading="reservedLoading"
          is-showing-reservations
        >
          <template #book-actions="{ requestOrReservation: reservation }">
            <chip-button
              :label="$t('manageUsers.actions')"
              color="primary"
              show-dropdown
            >
              <q-item
                v-close-popup
                clickable
                @click="putBooksIntoCart(reservation)"
              >
                <q-item-section>
                  {{ $t("book.reservedBooksDialog.options.cart") }}
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                @click="removeFromReserved(reservation)"
              >
                <q-item-section>
                  {{ $t("common.delete") }}
                </q-item-section>
              </q-item>
            </chip-button>
          </template>
        </requested-reserved-table>

        <span class="q-px-md q-py-md text-h6 text-primary">
          {{
            $t("manageUsers.requestedBooksDialog.title", [
              `${userData.firstname} ${userData.lastname}`,
            ])
          }}
        </span>

        <requested-reserved-table
          :rows="bookRequests"
          :loading="requestLoading"
          class="col"
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
                  @click="putBooksIntoCart(request)"
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
      </q-card-section>
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
import { lowerCase, startCase } from "lodash-es";
import { Dialog, QDialog, useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { notifyError } from "src/helpers/error-messages";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
import { fetchBookByISBN } from "src/services/book";
import { useCartService } from "src/services/cart";
import { useRequestService } from "src/services/request";
import { RequestSummaryFragment } from "src/services/request.graphql";
import { useReservationService } from "src/services/reservation";
import { ReservationSummaryFragment } from "src/services/reservation.graphql";
import { CustomerFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import CardTableHeader from "./card-table-header.vue";
import ChipButton from "./chip-button.vue";
import RequestedReservedTable from "./requested-reserved-table.vue";
import RoundBadge from "./round-badge.vue";

const { t } = useI18n();

const largeBreakpoint = 1920;
const smallBreakpoint = 1440;
const screenWidth = useScreenWidth(smallBreakpoint, largeBreakpoint);

const props = defineProps<{
  userData: CustomerFragment;
  retailLocationId: string;
}>();
const booksCartCount = ref(props.userData.booksInCart);

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

const {
  useCreateReservationsMutation,
  useDeleteReservationMutation,
  useGetReservationsQuery,
} = useReservationService();

const {
  userReservations,
  loading: reservedLoading,
  refetch: refetchReservations,
} = useGetReservationsQuery({
  retailLocationId: props.retailLocationId,
  userId: props.userData.id,
});

const { useDeleteRequestMutation, useGetRequestsQuery } = useRequestService();
const {
  bookRequests,
  loading: requestLoading,
  refetch: refetchRequests,
} = useGetRequestsQuery({
  retailLocationId: props.retailLocationId,
  userId: props.userData.id,
});

const { deleteReservation } = useDeleteReservationMutation();
function deleteAllReserved() {
  Dialog.create({
    title: t("manageUsers.reservedBooksDialog.confirmDialog.title"),
    ok: t("manageUsers.reservedBooksDialog.confirmDialog.confirmButton"),
    cancel: t("common.cancel"),
    message: t("manageUsers.reservedBooksDialog.confirmDialog.message"),
  }).onOk(async () => {
    try {
      await Promise.all(
        userReservations.value.map(({ id }) => {
          return deleteReservation({
            input: {
              id,
            },
          });
        }),
      );
    } catch {
      notifyError(t("bookErrors.notAllReservationsDeleted"));
    } finally {
      await Promise.all([refetchReservations(), refetchRequests()]);
    }
  });
}

async function removeFromReserved(reservation: ReservationSummaryFragment) {
  try {
    await deleteReservation({
      input: {
        id: reservation.id,
      },
    });
  } catch {
    notifyError(t("bookErrors.notReservationDeleted"));
  } finally {
    await Promise.all([refetchReservations(), refetchRequests()]);
  }
  reservation;
}

const { createReservations } = useCreateReservationsMutation();
async function reserveBook({ book }: RequestSummaryFragment) {
  if (!book.meta.isAvailable) {
    return;
  }

  try {
    await createReservations({
      input: {
        userId: props.userData.id,
        retailLocationId: props.retailLocationId,
        bookIds: [book.id],
      },
    });
  } catch {
    notifyError(t("bookErrors.notReserved"));
  } finally {
    await refetchReservations();
    await refetchRequests();
  }
}
async function addReservationFromIsbn(isbnCode: string) {
  try {
    const book = await fetchBookByISBN(isbnCode);

    if (!book) {
      notifyError(t("bookErrors.noBook"));
      return;
    }
    if (!book.meta.isAvailable) {
      notifyError(
        t("bookErrors.notAvailable", [startCase(lowerCase(book.title))]),
      );
      return;
    }

    await createReservations({
      input: {
        userId: props.userData.id,
        retailLocationId: props.retailLocationId,
        bookIds: [book.id],
      },
    });
  } catch {
    notifyError(t("bookErrors.notReserved"));
  } finally {
    await refetchReservations();
    await refetchRequests();
  }
}

const { useAddToCartMutation, useOpenCartMutation } = useCartService();
const { openCart } = useOpenCartMutation();
const { addToCart } = useAddToCartMutation();
async function moveAllIntoCart() {
  const reservedBooksIds = userReservations.value.map(({ id }) => id);
  const requestedAndAvailableBooksIds = bookRequests.value
    .filter(({ book }) => book.meta.isAvailable)
    .map(({ id }) => id);

  try {
    const cart = await openCart({
      input: {
        retailLocationId: props.retailLocationId,
        userId: props.userData.id,
      },
    });

    const reservationsAndRequestsToMoveIntoCart = [
      ...reservedBooksIds.map((id) => {
        return addToCart({
          input: {
            cartId: cart.data.id,
            fromReservationId: id,
          },
        });
      }),
      ...requestedAndAvailableBooksIds.map((id) => {
        return addToCart({
          input: {
            cartId: cart.data.id,
            fromBookRequestId: id,
          },
        });
      }),
    ];

    await Promise.all(reservationsAndRequestsToMoveIntoCart);

    booksCartCount.value += reservationsAndRequestsToMoveIntoCart.length;
  } catch {
    notifyError(t("bookErrors.notAllReservationsBooks"));
  } finally {
    await refetchReservations();
  }
}
async function moveReservedIntoCart() {
  const reservedBooksIds = userReservations.value.map(({ id }) => id);
  try {
    const cart = await openCart({
      input: {
        retailLocationId: props.retailLocationId,
        userId: props.userData.id,
      },
    });

    await Promise.all(
      reservedBooksIds.map((id) => {
        return addToCart({
          input: {
            cartId: cart.data.id,
            fromBookRequestId: id,
          },
        });
      }),
    );

    booksCartCount.value += reservedBooksIds.length;
  } catch {
    notifyError(t("bookErrors.notMoveReservationsIntoCart"));
  } finally {
    await refetchReservations();
  }
}

async function putBooksIntoCart(
  requestOrReservation: ReservationSummaryFragment | RequestSummaryFragment,
) {
  if (
    requestOrReservation.__typename === "BookRequest" &&
    !requestOrReservation.book.meta.isAvailable
  ) {
    notifyError(t("bookErrors.bookNotCartable"));
    return;
  }

  const isRequest = requestOrReservation.__typename === "BookRequest";

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
        ...(isRequest
          ? { fromBookRequestId: requestOrReservation.id }
          : { fromReservationId: requestOrReservation.id }),
      },
    });

    booksCartCount.value++;
  } catch {
    notifyError(
      isRequest
        ? t("bookErrors.notIntoCart")
        : t("bookErrors.notMoveReservationIntoCart"),
    );
  } finally {
    // Probably this can be improved with an if
    await Promise.all([refetchReservations(), refetchRequests()]);
  }
}

const { deleteBookRequest } = useDeleteRequestMutation();
async function deleteRequest(request: RequestSummaryFragment) {
  try {
    await deleteBookRequest({
      input: {
        id: request.id,
      },
    });
  } catch {
    notifyError(t("bookErrors.notRequestDeleted"));
  } finally {
    await refetchRequests();
  }
}
</script>
