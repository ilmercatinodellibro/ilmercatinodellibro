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
          v-model:pagination="reservedPagination"
          :rows="reservedRows"
          class="col"
          @request="onReservedRequest"
        >
          <template #book-actions="{ book }">
            <chip-button
              :label="$t('manageUsers.actions')"
              color="primary"
              show-dropdown
            >
              <q-item v-close-popup clickable @click="putBooksIntoCart([book])">
                <q-item-section>
                  {{ $t("book.reservedBooksDialog.options.cart") }}
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="removeFromReserved(book)">
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
          v-model:pagination="requestedPagination"
          :rows="requestedRows"
          class="col"
          @request="onRequestedRequest"
        >
          <template #book-actions="{ book }">
            <chip-button
              :label="$t('manageUsers.actions')"
              color="primary"
              show-dropdown
            >
              <!-- FIXME: add actual field check to show this action -->
              <q-item
                v-if="book.status === 'available'"
                v-close-popup
                clickable
                @click="reserveBooks([book])"
              >
                <q-item-section>
                  {{ $t("book.reservedBooksDialog.options.reserved") }}
                </q-item-section>
              </q-item>
              <q-item
                v-if="book.status === 'available'"
                v-close-popup
                clickable
                @click="putBooksIntoCart([book])"
              >
                <q-item-section>
                  {{ $t("book.reservedBooksDialog.options.cart") }}
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="deleteReservation(book)">
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
import { Dialog, QDialog, QTableProps, useDialogPluginComponent } from "quasar";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { WidthSize, useScreenWidth } from "src/helpers/screen";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";
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
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

// TODO: remove the pagination management and stubs once the real queries are added
const currentReservedPage = ref(0);
const currentRequestedPage = ref(0);

const reservedRowsPerPage = ref(5);
const requestedRowsPerPage = ref(5);

const {
  refetchBooks: reservedRefetchBooks,
  booksPaginationDetails: reservedBooksPaginationDetails,
  loading: reservedLoading,
} = useBookService(currentReservedPage, reservedRowsPerPage);

const {
  refetchBooks: requestedRefetchBooks,
  booksPaginationDetails: requestedBooksPaginationDetails,
  loading: requestedLoading,
} = useBookService(currentRequestedPage, requestedRowsPerPage);

const reservedPagination = ref({
  page: currentReservedPage.value,
  rowsPerPage: reservedRowsPerPage.value,
  rowsNumber: reservedBooksPaginationDetails.value.rowCount,
});

const requestedPagination = ref({
  page: currentRequestedPage.value,
  rowsPerPage: requestedRowsPerPage.value,
  rowsNumber: requestedBooksPaginationDetails.value.rowCount,
});

const reservedRows = ref<BookSummaryFragment[]>([]);
const requestedRows = ref<BookSummaryFragment[]>([]);

const largeBreakpoint = 1920;
const smallBreakpoint = 1440;

const screenWidth = useScreenWidth(smallBreakpoint, largeBreakpoint);

onMounted(async () => {
  // FIXME: add actual query to retrieve the books
  const reservedBooks = await reservedRefetchBooks();
  reservedRows.value = reservedBooks?.data.books.rows ?? [];
  const requestedBooks = await requestedRefetchBooks();
  requestedRows.value = requestedBooks?.data.books.rows ?? [];
});

const onReservedRequest: QTableProps["onRequest"] = async (requestProps) => {
  reservedLoading.value = true;

  const payload = await reservedRefetchBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
  });

  reservedRows.value = payload?.data.books.rows ?? [];

  reservedPagination.value.rowsNumber = payload?.data.books.rowsCount ?? 0;
  reservedPagination.value.page = requestProps.pagination.page;
  reservedPagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;

  reservedLoading.value = false;
};

const onRequestedRequest: QTableProps["onRequest"] = async (requestProps) => {
  requestedLoading.value = true;

  const payload = await requestedRefetchBooks({
    page: requestProps.pagination.page - 1,
    rows: requestProps.pagination.rowsPerPage,
  });

  requestedRows.value = payload?.data.books.rows ?? [];

  requestedPagination.value.rowsNumber = payload?.data.books.rowsCount ?? 0;
  requestedPagination.value.page = requestProps.pagination.page;
  requestedPagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;

  requestedLoading.value = false;
};

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

function putBooksIntoCart(books: BookSummaryFragment[]) {
  // FIXME: add book to the cart
  books;
}

function removeFromReserved(book: BookSummaryFragment) {
  // FIXME: delete the reservation only, the book request is kept
  book;
}

function reserveBooks(books: BookSummaryFragment[]) {
  // FIXME: add reserve books logic
  books;
}

function deleteReservation(book: BookSummaryFragment) {
  // FIXME: add reservation deletion logic
  book;
}
</script>
