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
              @click="reserveAllRequested()"
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
              <!-- FIXME: add correct display of number of books in the cart -->
              <round-badge :label="0" color="accent" float-left-square />
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
                  <q-item clickable @click="reserveAllRequested()">
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
              <q-item v-close-popup clickable @click="putBookIntoCart(request)">
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
// import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
import { fetchBookByISBN } from "src/services/book";
import { useRequestService } from "src/services/request";
import { RequestSummaryFragment } from "src/services/request.graphql";
import { UserSummaryFragment } from "src/services/user.graphql";
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
  userData: UserSummaryFragment;
  retailLocationId: string;
}>();

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
} = useGetRequestsQuery(
  {
    retailLocationId: props.retailLocationId,
    userId: props.userData.id,
  },
  {
    enabled: !!props.retailLocationId,
  },
);

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

function reserveBook(request: RequestSummaryFragment) {
  // FIXME: add reserve book logic
  request;
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
    Notify.create({
      type: "negative",
      message: "Non tutte le richieste sono state cancellate.",
    });
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
    Notify.create({
      type: "negative",
      message: "Non è stato possibile cancellare la richiesta.",
    });
  } finally {
    await refetchRequests();
  }
}

function moveAllIntoCart() {
  // FIXME: add logic to add requested books to the cart
}

function putBookIntoCart(request: RequestSummaryFragment) {
  // FIXME: add book to the cart
  request;
}

function reserveAllRequested() {
  // FIXME: add logic to reserve all books
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
