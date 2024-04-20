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
      <card-table-header @add-book="addReservationFromIsnb">
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
              @click="goToCart()"
            >
              <!-- FIXME: add correct display of number of books in the cart -->
              <round-badge :label="0" color="accent" float-left-square />
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

      <q-card-section
        class="col column flex-delegate-height-management no-wrap q-pa-none"
      >
        <requested-reserved-table
          :rows="userReservations"
          class="col"
          :loading="reservedLoading"
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
                @click="putBooksIntoCart([reservation])"
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
              <!-- FIXME: add actual field check to show this action -->
              <template v-if="request.book.meta.isAvailable">
                <q-item v-close-popup clickable @click="reserveBook(request)">
                  <q-item-section>
                    {{ $t("book.reservedBooksDialog.options.reserved") }}
                  </q-item-section>
                </q-item>
                <q-item
                  v-close-popup
                  clickable
                  @click="putBooksIntoCart([request])"
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
import { Dialog, Notify, QDialog, useDialogPluginComponent } from "quasar";
import { useI18n } from "vue-i18n";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
import { fetchBookByISBN } from "src/services/book";
import { useRequestService } from "src/services/request";
import { RequestSummaryFragment } from "src/services/request.graphql";
import { useReservationService } from "src/services/reservation";
import { ReservationSummaryFragment } from "src/services/reservation.graphql";
import { UserSummaryFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import CardTableHeader from "./card-table-header.vue";
import CartDialog from "./cart-dialog.vue";
import ChipButton from "./chip-button.vue";
import RequestedReservedTable from "./requested-reserved-table.vue";
import RoundBadge from "./round-badge.vue";

const { t } = useI18n();

const largeBreakpoint = 1920;
const smallBreakpoint = 1440;
const screenWidth = useScreenWidth(smallBreakpoint, largeBreakpoint);

const props = defineProps<{
  userData: UserSummaryFragment;
  retailLocationId: string;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

const {
  useCreateReservationsMutation,
  useDeleteReservationMutation,
  useGetReservationsQuery,
} = useReservationService();

// TODO: add actual queries to return reserved and requested books, instead of all books
const {
  userReservations,
  loading: reservedLoading,
  refetch: refetchReservations,
} = useGetReservationsQuery({
  retailLocationId: props.retailLocationId,
  userId: props.userData.id,
});

const { useGetRequestsQuery } = useRequestService();
const {
  bookRequests,
  loading: requestLoading,
  refetch: refetchRequests,
} = useGetRequestsQuery({
  retailLocationId: props.retailLocationId,
  userId: props.userData.id,
});

const { createReservations } = useCreateReservationsMutation();
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
      Notify.create({
        type: "negative",
        // TODO: translate this one
        message: `Non è stato possibile cancellare tutte le prenotazioni.`,
      });
    } finally {
      await refetchReservations();
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
    Notify.create({
      type: "negative",
      // TODO: translate this one
      message: `Non è stato possibile cancellare la prenotazione.`,
    });
  } finally {
    await refetchReservations();
    await refetchRequests();
  }
  reservation;
}
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
    Notify.create({
      type: "negative",
      // TODO: translate this one
      message: "Non è stato possibile prenotare il libro.",
    });
  } finally {
    await refetchReservations();
    await refetchRequests();
  }
}
async function addReservationFromIsnb(isbnCode: string) {
  try {
    const book = await fetchBookByISBN(isbnCode);

    if (!book) {
      Notify.create({
        type: "negative",
        // TODO: translate this one
        message: "Il codice ISBN inserito non corrisponde a nessun libro.",
      });
      return;
    }

    if (!book.meta.isAvailable) {
      Notify.create({
        type: "negative",
        // TODO: translate this one
        message: `Il libro ${book.title} non è disponibile per essere prenotato.`,
      });
      return;
    }
  } catch {
    Notify.create({
      type: "negative",
      // TODO: translate this one
      message: "Non è stato possibile prenotare il libro.",
    });
  } finally {
    await refetchReservations();
    await refetchRequests();
  }
}

function moveAllIntoCart() {
  // FIXME: add all reserved and available books into the cart
}

function moveReservedIntoCart() {
  // FIXME: add logic to add reserved books to the cart
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

function putBooksIntoCart(
  requestsOrReservations:
    | ReservationSummaryFragment[]
    | RequestSummaryFragment[],
) {
  // FIXME: add book to the cart
  requestsOrReservations;
}

// const { createReservations } = useCreateReservationsMutation();
// const { deleteReservation } = useDeleteReservationMutation();

function deleteRequest(request: RequestSummaryFragment) {
  // FIXME: add reservation deletion logic
  request;
}
</script>
