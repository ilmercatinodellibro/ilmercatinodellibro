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
              @click="deleteAllRequests()"
            />
            <q-btn
              v-if="selectedLocation.maxBookingDays > 0"
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
                  <q-item clickable @click="deleteAllRequests()">
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
import { ApolloCache } from "@apollo/client";
import {
  mdiCart,
  mdiCartPlus,
  mdiDelete,
  mdiDotsVertical,
} from "@quasar/extras/mdi-v7";
import { useApolloClient } from "@vue/apollo-composable";
import { Dialog, Notify, QDialog, useDialogPluginComponent } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { evictQuery } from "src/apollo/cache";
import { notifyError } from "src/helpers/error-messages";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
import { fetchBookByISBN } from "src/services/book";
import { useCartService } from "src/services/cart";
import { useRequestService } from "src/services/request";
import {
  GetRequestsDocument,
  RequestSummaryFragment,
} from "src/services/request.graphql";
import { useReservationService } from "src/services/reservation";
import { GetReservationsDocument } from "src/services/reservation.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import { CustomerFragment } from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import CardTableHeader from "./card-table-header.vue";
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
// TODO: Update userData.booksInCart cache and directly use it instead
const booksCartCount = ref(props.userData.booksInCart);

defineEmits(useDialogPluginComponent.emitsObject);
const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
  useDialogPluginComponent();

const { selectedLocation } = useRetailLocationService();

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
      message: t("bookErrors.noBook"),
    });
    return;
  }

  try {
    const { data: newRequest, cache } = await createBookRequest({
      input: { bookId: book.id, userId: props.userData.id },
    });

    updateRequestsCache(cache, (requests) => [...requests, newRequest]);
  } catch (error) {
    notifyError(t("bookErrors.notRequested"));
  } finally {
    await refetchRequests();
  }
}

const { resolveClient } = useApolloClient();
const { deleteBookRequest } = useDeleteRequestMutation();
async function deleteAllRequests() {
  const { cache } = resolveClient();

  const results = await Promise.allSettled(
    bookRequests.value.map(async ({ id }) => {
      await deleteBookRequest({
        input: {
          id,
        },
      });
      return id;
    }),
  );

  const failed = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (failed.length > 0) {
    notifyError(t("bookErrors.notAllRequestsDeleted"));
  }

  const removedIds = results
    .filter(
      (result): result is PromiseFulfilledResult<string> =>
        result.status === "fulfilled",
    )
    .map(({ value }) => value);
  updateRequestsCache(cache, (requests) =>
    requests.filter(({ id }) => !removedIds.includes(id)),
  );
}
async function deleteRequest(request: RequestSummaryFragment) {
  try {
    const { cache } = await deleteBookRequest({
      input: {
        id: request.id,
      },
    });

    updateRequestsCache(cache, (requests) =>
      requests.filter(({ id }) => id !== request.id),
    );
  } catch {
    notifyError(t("bookErrors.notRequestDeleted"));
  }
}

function updateRequestsCache<T>(
  cache: ApolloCache<T>,
  getRequests: (
    requests: RequestSummaryFragment[],
  ) => RequestSummaryFragment[] | undefined,
) {
  cache.updateQuery(
    {
      query: GetRequestsDocument,
      variables: {
        retailLocationId: props.retailLocationId,
        userId: props.userData.id,
      },
    },
    (data) => {
      if (!data) {
        return;
      }

      const bookRequests = getRequests(data.bookRequests);
      return bookRequests ? { bookRequests } : data;
    },
  );
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
    const { cache } = await createReservations({
      input: {
        userId: props.userData.id,
        retailLocationId: props.retailLocationId,
        bookIds: availableBookIds,
      },
    });
    await refetchRequests();
    evictQuery(cache, GetReservationsDocument);
    cache.gc();

    Notify.create({
      type: "positive",
      message: t("manageUsers.reservedBooksDialog.requestsReserved", [
        availableBookIds.length,
      ]),
    });
  } catch {
    notifyError(t("bookErrors.notAllReserved"));
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
      message: t("manageUsers.reservedBooksDialog.bookReserved", [book.title]),
    });
  } catch {
    notifyError(t("bookErrors.notReserved"));
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
    const { data: cart } = await openCart({
      input: {
        retailLocationId: props.retailLocationId,
        userId: props.userData.id,
      },
    });

    await Promise.all(
      availableBooksRequestIds.map((id) => {
        return addToCart({
          input: {
            cartId: cart.id,
            fromBookRequestId: id,
          },
        });
      }),
    );

    booksCartCount.value += availableBooksRequestIds.length;
  } catch {
    notifyError(t("bookErrors.notAllIntoCart"));
  } finally {
    await refetchRequests();
  }
}
async function putRequestedBookIntoCart(request: RequestSummaryFragment) {
  if (!request.book.meta.isAvailable) {
    return;
  }

  try {
    const { data: cart } = await openCart({
      input: {
        retailLocationId: props.retailLocationId,
        userId: props.userData.id,
      },
    });

    await addToCart({
      input: {
        cartId: cart.id,
        fromBookRequestId: request.id,
      },
    });

    booksCartCount.value++;
  } catch {
    notifyError(t("bookErrors.notIntoCart"));
  } finally {
    await refetchRequests();
  }
}
</script>
