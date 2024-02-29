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
      <card-table-header>
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
        v-model:pagination="pagination"
        :loading="loading"
        :rows="rows"
        class="flex-delegate-height-management"
        @request="onRequest"
      >
        <template #book-actions="{ book }">
          <chip-button
            :label="$t('manageUsers.actions')"
            color="primary"
            show-dropdown
          >
            <!-- FIXME: add actual field check to show this action -->
            <template v-if="book.status === 'available'">
              <q-item
                v-close-popup
                clickable
                @click="reserveBook(book)"
              >
                <q-item-section>
                  {{ $t("book.reservedBooksDialog.options.reserved") }}
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                @click="putBookIntoCart(book)"
              >
                <q-item-section>
                  {{ $t("book.reservedBooksDialog.options.cart") }}
                </q-item-section>
              </q-item>
            </template>

            <q-item v-close-popup clickable @click="deleteRequest(book)">
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
import { Dialog, QDialog, QTable, useDialogPluginComponent } from "quasar";
import { ref } from "vue";
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

const smallBreakpoint = 1230;
const largeBreakpoint = 1695;

const screenWidth = useScreenWidth(smallBreakpoint, largeBreakpoint);

const props = defineProps<{
  userData: UserSummaryFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

// TODO: remove the pagination management and stubs once the real queries are added
const currentPage = ref(0);
const numberOfRows = ref(5);

const { refetchBooks, booksPaginationDetails, loading } = useBookService(
  currentPage,
  numberOfRows,
);

const pagination = ref({
  rowsPerPage: numberOfRows.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  page: currentPage.value,
});

const rows = ref<BookSummaryFragment[]>([]);

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

function reserveBook(book: BookSummaryFragment) {
  // FIXME: add reserve book logic
  book;
}

function deleteAllRequested() {
  // FIXME: add logic to delete all requests
}

function moveAllIntoCart() {
  // FIXME: add logic to add requested books to the cart
}

function putBookIntoCart(book: BookSummaryFragment) {
  // FIXME: add book to the cart
  book;
}

function deleteRequest(book: BookSummaryFragment) {
  // FIXME: add request deletion logic
  book;
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

const onRequest: QTable["onRequest"] = async function ({ pagination: pag }) {
  loading.value = true;

  const payload = await refetchBooks();

  // FIXME: reserve this filtering to the actual query
  rows.value.splice(0, rows.value.length, ...(payload?.data.books.rows ?? []));

  pagination.value.rowsNumber = rows.value.length;
  pagination.value.page = pag.page;
  pagination.value.rowsPerPage = pag.rowsPerPage;

  loading.value = false;
};
</script>
