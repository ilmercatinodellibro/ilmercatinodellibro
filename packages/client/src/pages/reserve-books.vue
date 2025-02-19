<template>
  <q-page>
    <q-card
      :class="!isMobile ? 'q-ma-md' : ''"
      class="absolute-full column no-wrap"
    >
      <q-card-section
        :class="isMobile ? 'column reverse' : 'row'"
        class="gap-16"
      >
        <q-input
          :model-value="tableFilter.searchQuery"
          :placeholder="t('common.search')"
          class="full-width max-width-600"
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

        <q-space v-if="!isMobile" />

        <div
          :class="isMobile ? 'column items-stretch' : 'row flex-center'"
          class="gap-16 no-padding no-wrap"
        >
          <q-btn
            v-if="!showByClass"
            :class="isMobile ? 'full-width' : ''"
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
              :class="isMobile ? 'full-width' : ''"
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
        :class="isMobile ? 'sticky-last-column' : ''"
        :columns="columns"
        :filter="tableFilter"
        :filter-method="filterMethod"
        :loading="loading"
        :rows="rows"
        :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
        class="col"
        @request="onRequest"
      >
        <template #body-cell-author="props">
          <table-cell-with-tooltip :props="props" :value="props.value" />
        </template>

        <template #body-cell-subject="props">
          <table-cell-with-tooltip :props :value="props.value" />
        </template>

        <template #body-cell-availability="props">
          <q-td :props>
            <status-chip :value="props.value" />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props auto-width>
            <chip-button v-if="!isMobile" v-bind="getButtonData(props.row)" />
            <actions-list-button v-else>
              <q-item
                v-close-popup
                clickable
                @click="getButtonData(props.row).onClick"
              >
                <q-item-section>
                  <q-item-label>
                    {{ getButtonData(props.row).label }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </actions-list-button>
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
import ActionsListButton from "src/components/actions-list-button.vue";
import FilterBySchoolDialog from "src/components/filter-by-school-dialog.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import StatusChip from "src/components/manage-users/status-chip.vue";
import TableCellWithTooltip from "src/components/manage-users/table-cell-with-tooltip.vue";
import ReserveBooksByClassDialog from "src/components/reserve-books-by-class-dialog.vue";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { useTableFilters } from "src/composables/use-table-filters";
import { discountedPrice } from "src/helpers/book-copy";
import { formatPrice } from "src/helpers/formatting";
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

const { t } = useI18n();
const router = useRouter();

const { user } = useAuthService();
const { selectedLocation } = useRetailLocationService();

const { isMobile } = useLateralDrawer();

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

const columns = computed<QTableColumn<BookSummaryFragment>[]>(() => [
  {
    name: "isbn",
    field: "isbnCode",
    label: t("book.fields.isbn"),
    align: "left",
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
    name: "author",
    field: "authorsFullName",
    label: t("book.fields.author"),
    align: "left",
    classes: "max-width-160 ellipsis",
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
    name: "availability",
    field: ({ meta }) => meta.isAvailable,
    label: t("book.fields.availability"),
    align: "left",
  },
  {
    name: "available-copies",
    field: ({ meta }) => meta.availableCount,
    label: t("reserveBooks.availableCopies"),
    align: "center",
  },
  {
    name: "actions",
    field: () => undefined,
    label: "",
    classes: isMobile.value ? "no-padding" : "",
  },
]);

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

  if (book.meta.isAvailable && selectedLocation.value.maxBookingDays > 0) {
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
      cache.gc();
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
  }).onOk(async (books: BookWithAvailableCopiesFragment[]) => {
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
