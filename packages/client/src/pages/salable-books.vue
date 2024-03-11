<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <q-card-section class="text-center title-section">
        <h6 class="q-ma-none text-primary text-weight-regular">
          {{ $t("salableBooks.title") }}
        </h6>
        <p class="q-mb-none q-mt-sm">
          {{ $t("salableBooks.subtitle") }}
        </p>
      </q-card-section>

      <q-card-section class="col column gap-24 no-padding no-wrap">
        <q-form class="flex-center gap-16 q-px-sm row" @submit="searchBook()">
          <q-input
            v-model="searchQuery"
            :placeholder="$t('salableBooks.searchHint')"
            :rules="[requiredRule, validISBN]"
            class="flex-grow max-width-600"
            lazy-rules="ondemand"
            outlined
            type="search"
          >
            <template #append>
              <q-icon :name="mdiMagnify" />
            </template>
          </q-input>

          <q-btn :label="$t('common.search')" color="accent" type="submit" />
        </q-form>

        <dialog-table
          :columns="columns"
          :loading="loading"
          :rows="rows"
          :rows-per-page-options="[0]"
          class="flex-delegate-height-management"
        >
          <template #body="{ row, cols }">
            <q-tr
              v-if="Object.values(AcceptanceStatus).includes(row.id)"
              class="bg-grey-1"
              no-hover
            >
              <q-td class="non-selectable text-weight-medium" colspan="5">
                {{ $t(`salableBooks.tableSectionTitles.${row.id}`) }}
              </q-td>
            </q-tr>
            <q-tr v-else-if="row.id === 'EMPTY'">
              <q-td colspan="5">
                {{ $t("salableBooks.emptyRowMessage") }}
              </q-td>
            </q-tr>
            <q-tr v-else>
              <q-td v-for="col in cols" :key="col.name">
                <span
                  v-if="col.name === 'status'"
                  :class="`text-${
                    row.status === AcceptanceStatus.ACCEPTED
                      ? 'positive'
                      : 'negative'
                  }`"
                >
                  {{ $t(`salableBooks.acceptanceStatus.${row.status}`) }}
                </span>
                <span v-else>
                  {{ col.value }}
                </span>
              </q-td>
            </q-tr>
          </template>
        </dialog-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { mdiMagnify } from "@quasar/extras/mdi-v7";
import { Notify, QTableColumn } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import { requiredRule, validISBN } from "src/helpers/rules";
import { useBookService } from "src/services/book";
import { BookSummaryFragment } from "src/services/book.graphql";

const { t } = useI18n();

const page = ref(0);
const rowsPerPage = ref(1);

const { loading, refetchBooks } = useBookService(page, rowsPerPage);

const searchQuery = ref("");

const columns = computed<QTableColumn<BookWithStatus>[]>(() => [
  {
    name: "status",
    field: "status",
    label: t("book.fields.status"),
    align: "left",
  },
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
]);

enum AcceptanceStatus {
  REJECTED = "rejected",
  ACCEPTED = "accepted",
}

interface GroupHeaderRow {
  id: AcceptanceStatus;
}

interface EmptyBodyRow {
  id: "EMPTY";
}

type BookWithStatus = {
  status: AcceptanceStatus;
} & BookSummaryFragment;

const acceptedBooks = ref<BookSummaryFragment[]>([]);
const rejectedBooks = ref<Pick<BookWithStatus, "isbnCode" | "status">[]>([]);

const rows = computed<
  (
    | BookWithStatus
    | Pick<BookWithStatus, "isbnCode" | "status">
    | GroupHeaderRow
    | EmptyBodyRow
  )[]
>(() => [
  {
    id: AcceptanceStatus.ACCEPTED,
  },
  ...(acceptedBooks.value.length
    ? acceptedBooks.value.map(
        (book) =>
          ({
            ...book,
            status: AcceptanceStatus.ACCEPTED,
          }) satisfies BookWithStatus,
      )
    : [
        {
          id: "EMPTY",
        } satisfies EmptyBodyRow,
      ]),
  { id: AcceptanceStatus.REJECTED },
  ...(rejectedBooks.value.length
    ? rejectedBooks.value
    : [
        {
          id: "EMPTY",
        } satisfies EmptyBodyRow,
      ]),
]);

async function searchBook() {
  if (
    acceptedBooks.value.find(
      ({ isbnCode }) => searchQuery.value === isbnCode,
    ) ??
    rejectedBooks.value.find(({ isbnCode }) => searchQuery.value === isbnCode)
  ) {
    Notify.create(t("salableBooks.alreadySearched"));
    return;
  }
  loading.value = true;
  const foundBook = (
    await refetchBooks({
      page: page.value,
      rows: rowsPerPage.value,
      filter: {
        search: searchQuery.value,
      },
    })
  )?.data.books.rows[0];
  loading.value = false;
  if (foundBook) {
    acceptedBooks.value.push(foundBook);
  } else {
    rejectedBooks.value.push({
      isbnCode: searchQuery.value,
      status: AcceptanceStatus.REJECTED,
    });
  }
}
</script>

<style scoped lang="scss">
.title-section {
  padding: 36px 8px;
}
</style>