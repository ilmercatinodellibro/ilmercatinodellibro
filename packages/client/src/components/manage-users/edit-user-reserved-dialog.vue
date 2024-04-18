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
      <card-table-header>
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

        <span class="q-pb-md q-px-md text-h6 text-primary">
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
import { Dialog, QDialog, useDialogPluginComponent } from "quasar";
import { useI18n } from "vue-i18n";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
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

const props = defineProps<{
  userData: UserSummaryFragment;
  retailLocationId: string;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

const {
  // useCreateReservationsMutation,
  // useDeleteReservationMutation,
  useGetReservationsQuery,
} = useReservationService();

const { userReservations, loading: reservedLoading } = useGetReservationsQuery(
  {
    retailLocationId: props.retailLocationId,

    userId: props.userData.id,
  },
  {
    enabled: !!props.retailLocationId,
  },
);

const { useGetRequestsQuery } = useRequestService();
const { bookRequests, loading: requestLoading } = useGetRequestsQuery(
  {
    retailLocationId: props.retailLocationId,
    userId: props.userData.id,
  },
  {
    enabled: !!props.retailLocationId,
  },
);

const largeBreakpoint = 1920;
const smallBreakpoint = 1440;

const screenWidth = useScreenWidth(smallBreakpoint, largeBreakpoint);

function deleteAllReserved() {
  Dialog.create({
    title: t("manageUsers.reservedBooksDialog.confirmDialog.title"),
    ok: t("manageUsers.reservedBooksDialog.confirmDialog.confirmButton"),
    cancel: t("common.cancel"),
    message: t("manageUsers.reservedBooksDialog.confirmDialog.message"),
  }).onOk(() => {
    // FIXME: add logic to delete all reserved books
  });
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

function removeFromReserved(reservation: ReservationSummaryFragment) {
  // FIXME: delete the reservation only, the book request is kept
  reservation;
}

function reserveBook(request: RequestSummaryFragment) {
  // FIXME: add reserve book logic
  request;
}

// const { createReservations } = useCreateReservationsMutation();
// const { deleteReservation } = useDeleteReservationMutation();

function deleteRequest(request: RequestSummaryFragment) {
  // FIXME: add reservation deletion logic
  request;
}
</script>
