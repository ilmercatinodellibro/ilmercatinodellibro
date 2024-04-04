<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <card-table-header
        v-model:book-isbn="searchQuery"
        :search-label="t('common.search')"
      >
        <template #side-actions>
          <q-btn
            v-if="!showByClass"
            :icon="mdiFilter"
            :label="$t('reserveBooks.filterButton')"
            class="text-transform-none"
            color="accent"
            @click="searchClassBooks()"
          />

          <template v-else>
            <q-btn
              :icon="mdiArrowLeft"
              :label="t('reserveBooks.backToMainList')"
              class="text-transform-none"
              outline
              @click="showByClass = false"
            />

            <q-btn
              :icon="mdiPlus"
              :label="t('reserveBooks.reserveAll')"
              color="positive"
              class="text-transform-none"
              @click="openReserveAllDialog()"
            />
          </template>
        </template>
      </card-table-header>

      <dialog-table
        v-model:pagination="tablePagination"
        :columns="columns"
        :filter="searchQuery"
        :loading="loading"
        :rows="showByClass ? classBooks : rows"
        class="col"
        @request="onRequest"
      >
        <template #body-cell-availability="{ value }">
          <q-td>
            <status-chip :value="value" />
          </q-td>
        </template>

        <template #body-cell-actions="{ row }">
          <q-td>
            <chip-button v-bind="getButtonData(row)" />
          </q-td>
        </template>
      </dialog-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { mdiArrowLeft, mdiFilter, mdiPlus } from "@quasar/extras/mdi-v7";
import { Dialog, QBtnProps, QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import ClassFiltersDialog from "src/components/class-filters-dialog.vue";
import CardTableHeader from "src/components/manage-users/card-table-header.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import ReserveBooksByClassDialog from "src/components/reserve-books-by-class-dialog.vue";
import { formatPrice } from "src/composables/use-misc-formats";
import { BooksTab, CourseDetails } from "src/models/book";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService } from "src/services/auth";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";
import { useRequestService } from "src/services/request";
import { useReservationService } from "src/services/reservation";
import { useRetailLocationService } from "src/services/retail-location";

const { user } = useAuthService();
const { selectedLocation } = useRetailLocationService();

const { useCreateReservationsMutation, useGetReservationsQuery } =
  useReservationService();

const { createReservations } = useCreateReservationsMutation();
const { userReservations, refetch: refetchReservations } =
  useGetReservationsQuery({
    retailLocationId: selectedLocation.value.id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    userId: user.value!.id,
  });

const { useCreateRequestMutation, useGetRequestsQuery } = useRequestService();

const { createBookRequest } = useCreateRequestMutation();
const { bookRequests, refetch: refetchRequests } = useGetRequestsQuery({
  retailLocationId: selectedLocation.value.id,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  userId: user.value!.id,
});

const { t } = useI18n();

const router = useRouter();

const columns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    name: "isbn",
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
    name: "availability",
    field: ({ meta }) => meta.isAvailable,
    label: t("book.fields.availability"),
    align: "left",
  },
  {
    name: "cover-price",
    field: "originalPrice",
    label: t("book.fields.coverPrice"),
    align: "left",
    format: formatPrice,
    classes: "text-strike text-black-54",
  },
  {
    name: "price",
    // TODO: add correct calculation
    field: ({ originalPrice }) => originalPrice,
    label: t("book.fields.price"),
    align: "left",
    format: formatPrice,
  },
  {
    name: "available-copies",
    // TODO: add field
    field: () => undefined,
    label: t("reserveBooks.availableCopies"),
    align: "left",
  },
  {
    name: "actions",
    field: () => undefined,
    label: "",
  },
]);

const currentPage = ref(0);
const rowsPerPage = ref(100);
const { booksPaginationDetails, loading, refetchBooks } = useBookService(
  currentPage,
  rowsPerPage,
);

const rows = ref<BookSummaryFragment[]>([]);
const tablePagination = ref({
  page: currentPage.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  rowsPerPage: rowsPerPage.value,
});

const searchQuery = ref("");

const showByClass = ref(false);

const classBooks = ref([]);

function getButtonData(book: BookSummaryFragment): QBtnProps {
  if (userReservations.value.find(({ book: { id } }) => id === book.id)) {
    return {
      color: "grey-9",
      label: t("reserveBooks.goToReservations"),
      async onClick() {
        await router.push({
          path: AvailableRouteNames.MyBooks,
          query: {
            tab: BooksTab.RESERVED,
          },
        });
      },
    };
  }
  if (bookRequests.value.find(({ book: { id } }) => id === book.id)) {
    return {
      color: "grey-9",
      label: t("reserveBooks.goToRequests"),
      async onClick() {
        await router.push({
          path: AvailableRouteNames.MyBooks,
          query: {
            tab: BooksTab.REQUESTED,
          },
        });
      },
    };
  }
  if (book.meta.isAvailable) {
    return {
      color: "primary",
      label: t("reserveBooks.reserveCopy"),
      async onClick() {
        await reserveBook(book.id);
      },
    };
  }
  return {
    color: "accent",
    label: t("reserveBooks.requestCopy"),
    onClick() {
      requestBook(book.id);
    },
  };
}

const onRequest: QTableProps["onRequest"] = async ({ pagination }) => {
  loading.value = true;

  const newBooks = await refetchBooks({
    page: pagination.page - 1,
    rows: pagination.rowsPerPage,
    filter: {
      search: searchQuery.value,
    },
  });
  tablePagination.value.rowsNumber =
    newBooks?.data.books.rowsCount ?? tablePagination.value.rowsNumber;

  rows.value = newBooks?.data.books.rows ?? rows.value;

  tablePagination.value.rowsPerPage = pagination.rowsPerPage;
  tablePagination.value.page = pagination.page;

  loading.value = false;
};

function searchClassBooks() {
  Dialog.create({
    component: ClassFiltersDialog,
  }).onOk((payload: CourseDetails) => {
    showByClass.value = true;
    // TODO: put specified class books into classBooks
    payload;
  });
}

async function reserveBook(id: string) {
  await createReservations({
    input: {
      bookIds: [id],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userId: user.value!.id,
      retailLocationId: selectedLocation.value.id,
    },
  });
  await refetchReservations();
}

function requestBook(bookId: string) {
  Dialog.create({
    title: t("reserveBooks.requestBookDisclaimer.title"),
    message: t("reserveBooks.requestBookDisclaimer.message"),
    cancel: t("common.cancel"),
    ok: t("reserveBooks.requestCopy"),
  }).onOk(async () => {
    await createBookRequest({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      input: { bookId, userId: user.value!.id },
    });
    await refetchRequests();
  });
}

function openReserveAllDialog() {
  Dialog.create({
    component: ReserveBooksByClassDialog,
    componentProps: {
      classBooks: classBooks.value,
    },
  }).onOk(async (books: BookSummaryFragment[]) => {
    await createReservations({
      input: {
        bookIds: books.map(({ id }) => id),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        userId: user.value!.id,
        retailLocationId: selectedLocation.value.id,
      },
    });

    showByClass.value = false;

    await refetchReservations();
  });
}
</script>

<style scoped lang="scss">
.text-transform-none {
  text-transform: none;
}
</style>
