<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <q-card-section class="gap-16 row">
        <q-input
          :model-value="tableFilter.searchQuery"
          :placeholder="t('common.search')"
          class="col max-width-600"
          clearable
          debounce="400"
          outlined
          type="search"
          @update:model-value="
            (value) => (tableFilter.searchQuery = (value as string) ?? '')
          "
        >
          <template v-if="tableFilter.searchQuery.length === 0" #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </q-input>

        <q-space />

        <div class="flex-center gap-16 no-padding no-wrap row">
          <q-btn
            v-if="!showByClass"
            :icon="mdiFilter"
            :label="$t('reserveBooks.filterButton')"
            class="text-transform-none"
            color="accent"
            @click="swapView()"
          />

          <template v-else>
            <q-btn
              :icon="mdiArrowLeft"
              :label="t('reserveBooks.backToMainList')"
              class="text-transform-none"
              outline
              @click="swapView()"
            />

            <q-btn
              :icon="mdiPlus"
              :label="t('reserveBooks.reserveAll')"
              color="positive"
              class="text-transform-none"
              @click="openReserveAllDialog()"
            />
          </template>
        </div>
      </q-card-section>

      <dialog-table
        v-model:pagination="tablePagination"
        :columns="columns"
        :filter="tableFilter"
        :filter-method="filterMethod"
        :loading="loading"
        :rows="rows"
        :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
        class="col"
        @request="onRequest"
      >
        <template #body-cell-author="{ value, col }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>

        <template #body-cell-subject="{ value, col }">
          <table-cell-with-tooltip :class="col.classes" :value="value" />
        </template>

        <template #body-cell-availability="{ value }">
          <q-td>
            <status-chip :value="value" />
          </q-td>
        </template>

        <template #body-cell-actions="{ row }">
          <q-td auto-width class="text-center">
            <chip-button v-bind="getButtonData(row)" />
          </q-td>
        </template>
      </dialog-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiFilter,
  mdiMagnify,
  mdiPlus,
} from "@quasar/extras/mdi-v7";
import { cloneDeep } from "lodash-es";
import { Dialog, Notify, QBtnProps, QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { evictQuery } from "src/apollo/cache";
import FilterBySchoolDialog from "src/components/filter-by-school-dialog.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import TableCellWithTooltip from "src/components/manage-users/table-cell-with-tooltip.vue";
import ReserveBooksByClassDialog from "src/components/reserve-books-by-class-dialog.vue";
import { formatPrice } from "src/composables/use-misc-formats";
import { useTableFilters } from "src/composables/use-table-filters";
import { discountedPrice } from "src/helpers/book-copy";
import { BooksTab, SchoolFilters } from "src/models/book";
import { AvailableRouteNames } from "src/models/routes";
import { useAuthService } from "src/services/auth";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";
import { BookWithAvailableCopiesFragment } from "src/services/cart.graphql";
import { useRequestService } from "src/services/request";
import { GetRequestsDocument } from "src/services/request.graphql";
import { useReservationService } from "src/services/reservation";
import { GetReservationsDocument } from "src/services/reservation.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const { user } = useAuthService();
const { selectedLocation } = useRetailLocationService();

const { useCreateReservationsMutation, useGetReservationsQuery } =
  useReservationService();

const { createReservations } = useCreateReservationsMutation();
const { userReservations } = useGetReservationsQuery({
  retailLocationId: selectedLocation.value.id,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  userId: user.value!.id,
});

const { useCreateRequestMutation, useGetRequestsQuery } = useRequestService();

const { createBookRequest } = useCreateRequestMutation();
const { bookRequests } = useGetRequestsQuery({
  retailLocationId: selectedLocation.value.id,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  userId: user.value!.id,
});

const { t } = useI18n();

const router = useRouter();

const columns = computed<QTableColumn<BookWithAvailableCopiesFragment>[]>(
  () => [
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
      classes: "max-width-160 ellipsis",
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
      field: "originalPrice",
      label: t("book.fields.price"),
      align: "left",
      format: (val: number) => discountedPrice(val, "sell"),
    },
    {
      name: "available-copies",
      field: ({ copies }) => copies?.length ?? 0,
      label: t("reserveBooks.availableCopies"),
      align: "center",
    },
    {
      name: "actions",
      field: () => undefined,
      label: "",
    },
  ],
);

const currentPage = ref(0);
const rowsPerPage = ref(100);
const {
  books: rows,
  booksPaginationDetails,
  loading,
  refetchBooks,
} = useBookService(currentPage, rowsPerPage);

const tablePagination = ref({
  page: currentPage.value,
  rowsNumber: booksPaginationDetails.value.rowCount,
  rowsPerPage: rowsPerPage.value,
});

const showByClass = ref(false);
const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200];

const { refetchFilterProxy, tableFilter, filterMethod } = useTableFilters(
  "book.filters.options",
  true,
);

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

  await refetchBooks({
    page: pagination.page - 1,
    rows: pagination.rowsPerPage,
    filter: refetchFilterProxy.value,
  });
  tablePagination.value.rowsNumber = booksPaginationDetails.value.rowCount;

  tablePagination.value.rowsPerPage = pagination.rowsPerPage;
  tablePagination.value.page = pagination.page;

  loading.value = false;
};

function swapView() {
  if (!showByClass.value) {
    Dialog.create({
      component: FilterBySchoolDialog,
      componentProps: {
        selectedFilters: tableFilter.schoolFilters,
        title: t("reserveBooks.findBooksDialog.title"),
        submitLabel: t("book.filter"),
        requireCourse: true,
      },
    }).onOk((newFilters: SchoolFilters) => {
      if (
        newFilters.selectedSchoolCodes.length > 0 ||
        newFilters.selectedSchoolCourseIds.length > 0
      ) {
        showByClass.value = true;
        tableFilter.schoolFilters = cloneDeep(newFilters);
      }
    });
  } else {
    showByClass.value = false;
    tableFilter.schoolFilters = undefined;
  }
}

async function reserveBook(id: string) {
  try {
    const { cache } = await createReservations({
      input: {
        bookIds: [id],
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        userId: user.value!.id,
        retailLocationId: selectedLocation.value.id,
      },
    });

    evictQuery(cache, GetReservationsDocument, {
      retailLocationId: selectedLocation.value.id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userId: user.value!.id,
    });
    cache.gc();
  } catch (e) {
    Notify.create(
      t("reserveBooks.reservationOrRequestError", [
        t("reserveBooks.reservation"),
        e,
      ]),
    );
  }
}

function requestBook(bookId: string) {
  Dialog.create({
    title: t("reserveBooks.requestBookDisclaimer.title"),
    message: t("reserveBooks.requestBookDisclaimer.message"),
    cancel: t("common.cancel"),
    ok: t("reserveBooks.requestCopy"),
  }).onOk(async () => {
    try {
      const { cache } = await createBookRequest({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        input: { bookId, userId: user.value!.id },
      });

      evictQuery(cache, GetRequestsDocument, {
        retailLocationId: selectedLocation.value.id,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        userId: user.value!.id,
      });
    } catch (e) {
      Notify.create(
        t("reserveBooks.reservationOrRequestError", [
          t("reserveBooks.request"),
          e,
        ]),
      );
    }
  });
}

function openReserveAllDialog() {
  Dialog.create({
    component: ReserveBooksByClassDialog,
    componentProps: {
      classBooks: rows.value,
    },
  }).onOk(async (books: BookSummaryFragment[]) => {
    try {
      const { cache } = await createReservations({
        input: {
          bookIds: books.map(({ id }) => id),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          userId: user.value!.id,
          retailLocationId: selectedLocation.value.id,
        },
      });

      evictQuery(cache, GetReservationsDocument, {
        retailLocationId: selectedLocation.value.id,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        userId: user.value!.id,
      });
      cache.gc();
    } catch (e) {
      Notify.create(
        t("reserveBooks.reservationOrRequestError", [
          t("reserveBooks.reservation"),
          e,
        ]),
      );
    } finally {
      swapView();
    }
  });
}
</script>

<style scoped lang="scss">
.text-transform-none {
  text-transform: none;
}
</style>
