<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-card
      :cancel-label="$t('common.close')"
      :title="
        $t('manageUsers.inStockDialog.title', [
          `${userData.firstname} ${userData.lastname}`,
        ])
      "
      size="fullscreen"
      @cancel="onDialogCancel"
    >
      <q-tabs v-model="tab" align="justify" active-color="accent" inline-label>
        <q-tab name="in-retrieval" :label="$t('manageUsers.inRetrieval')" />
        <q-tab name="retrieved" :label="$t('manageUsers.retrieved')">
          <template #default>
            <q-icon :name="mdiInformationOutline" class="q-ml-sm" size="sm">
              <q-tooltip>
                {{ $t("manageUsers.inStockDialog.retrievableTooltip") }}
              </q-tooltip>
            </q-icon>
          </template>
        </q-tab>
      </q-tabs>

      <q-tab-panels
        v-model="tab"
        animated
        class="col column dialog-panels flex-delegate-height-management hide-scrollbar no-wrap"
      >
        <q-tab-panel
          name="in-retrieval"
          class="col column flex-delegate-height-management no-wrap q-pa-none"
        >
          <card-table-header @add-book="addBookToBeRegistered">
            <template #side-actions>
              <q-btn
                :disable="booksToRegister.length === 0"
                :label="$t('manageUsers.inStockDialog.retrieveBtn')"
                color="primary"
                no-wrap
                @click="retrieveAllBooks"
              />
            </template>
          </card-table-header>

          <dialog-table
            :rows="booksToRegister"
            :columns="booksToRegisterColumns"
            class="col"
          >
            <template #body-cell-status="{ value }">
              <q-td>
                <status-chip :value="value" />
              </q-td>
            </template>

            <template #body-cell-utility="{ value }">
              <q-td class="text-center">
                <utility-chip :utility="value" />
              </q-td>
            </template>

            <template #body-cell-actions="{ rowIndex }">
              <q-td class="text-center">
                <chip-button
                  color="primary"
                  no-wrap
                  @click="openDeleteBookDialog(rowIndex)"
                >
                  <q-item-label> {{ $t("common.delete") }} </q-item-label>
                  <q-icon
                    class="q-ml-sm"
                    :name="mdiInformationOutline"
                    size="18px"
                  >
                    <q-tooltip>
                      {{ $t("manageUsers.inStockDialog.deleteBookBtnTooltip") }}
                    </q-tooltip>
                  </q-icon>
                </chip-button>
              </q-td>
            </template>
          </dialog-table>
        </q-tab-panel>

        <q-tab-panel
          name="retrieved"
          class="column flex-delegate-height-management no-wrap q-pa-none"
        >
          <dialog-table
            :rows="copiesInStock"
            :columns="copiesInStockColumns"
            :loading="inStockLoading"
            class="col"
          >
            <template #body-cell-status="{ value }">
              <q-td>
                <status-chip :value="value" />
              </q-td>
            </template>

            <template #body-cell-utility="{ value }">
              <q-td>
                <utility-chip :utility="value" />
              </q-td>
            </template>

            <template #body-cell-actions="{ row }">
              <!-- TODO: hide it when the book has been lost -->
              <q-td>
                <chip-button
                  :label="
                    $t('manageUsers.payOffUserDialog.returnOptions.return')
                  "
                  color="primary"
                  @click="returnBook(row)"
                />
              </q-td>
            </template>
          </dialog-table>
        </q-tab-panel>
      </q-tab-panels>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiInformationOutline } from "@quasar/extras/mdi-v7";
import { startCase, toLower } from "lodash-es";
import { Dialog, QTableColumn, useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { evictQuery } from "src/apollo/cache";
import { fetchBookByISBN } from "src/services/book";
import {
  BookCopyDetailsFragment,
  GetBookCopiesByOwnerDocument,
  useCreateBookCopiesMutation,
  useGetBookCopiesByOwnerQuery,
} from "src/services/book-copy.graphql";
import { BookSummaryFragment } from "src/services/book.graphql";
import { GetReceiptsDocument } from "src/services/receipt.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import {
  CustomerFragment,
  CustomerFragmentDoc,
} from "src/services/user.graphql";
import KDialogCard from "../k-dialog-card.vue";
import UtilityChip from "../utility-chip.vue";
import CardTableHeader from "./card-table-header.vue";
import ChipButton from "./chip-button.vue";
import DialogTable from "./dialog-table.vue";
import RetrieveAllBooksDialog from "./retrieve-all-books-dialog.vue";
import StatusChip from "./status-chip.vue";

const props = defineProps<{
  userData: CustomerFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogHide } = useDialogPluginComponent();

const { t } = useI18n();

const { createBookCopies } = useCreateBookCopiesMutation();

const tab = ref("in-retrieval");

const booksToRegister = ref<BookSummaryFragment[]>([]);

const { selectedLocation } = useRetailLocationService();
const { bookCopiesByOwner: copiesInStock, loading: inStockLoading } =
  useGetBookCopiesByOwnerQuery(() => ({
    userId: props.userData.id,
    retailLocationId: selectedLocation.value.id,
  }));

// probably unnecessarily complex, but 🤷
function getCommonColumns<
  const TEntity extends "book" | "copy",
  TFragment extends TEntity extends "book"
    ? BookSummaryFragment
    : BookCopyDetailsFragment,
>(entity: TEntity): QTableColumn<TFragment>[] {
  const getField = (
    field: QTableColumn<BookSummaryFragment>["field"],
  ): QTableColumn<TFragment>["field"] =>
    entity === "book"
      ? (field as QTableColumn<TFragment>["field"])
      : (row) => {
          const book = (row as BookCopyDetailsFragment).book;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return typeof field === "function" ? field(book) : book[field];
        };

  return [
    {
      label: t("book.fields.author"),
      field: getField("authorsFullName"),
      name: "author",
      align: "left",
      format: (val: string) => startCase(toLower(val)),
    },
    {
      label: t("book.fields.subject"),
      field: getField("subject"),
      name: "subject",
      align: "left",
      format: (val: string) => startCase(toLower(val)),
    },
    {
      label: t("book.fields.status"),
      field: getField(({ meta }) => meta.isAvailable),
      name: "status",
      align: "left",
    },
    {
      label: t("book.fields.title"),
      field: getField("title"),
      name: "title",
      align: "left",
      format: (val: string) => startCase(toLower(val)),
    },
    {
      label: t("book.fields.publisher"),
      field: getField("publisherName"),
      name: "publisher",
      align: "left",
      format: (val: string) => startCase(toLower(val)),
    },
    {
      label: t("book.fields.price"),
      field: getField("originalPrice"),
      name: "price",
      headerClasses: "text-center",
      align: "left",
      format: (val: number) => `${val.toFixed(2)} €`,
    },
    {
      label: t("book.fields.utility"),
      // TODO: add the field name
      field: () => undefined,
      name: "utility",
      align: "center",
    },
  ];
}

const booksToRegisterColumns = computed<QTableColumn<BookSummaryFragment>[]>(
  () => [
    {
      label: t("book.fields.isbn"),
      field: "isbnCode",
      name: "isbn",
      align: "left",
      format: (val: string) => startCase(toLower(val)),
    },

    ...getCommonColumns("book"),

    {
      label: t("manageUsers.actions"),
      field: () => undefined,
      name: "actions",
      align: "center",
    },
  ],
);

const copiesInStockColumns = computed<QTableColumn<BookCopyDetailsFragment>[]>(
  () => [
    {
      label: t("book.fields.isbn"),
      field: ({ book }) => book.isbnCode,
      name: "isbn",
      align: "left",
    },
    {
      label: t("book.code"),
      field: "code",
      name: "code",
      align: "left",
    },
    {
      label: t("book.originalCode"),
      field: "originalCode",
      name: "original-code",
      align: "left",
    },

    ...getCommonColumns("copy"),
  ],
);

async function addBookToBeRegistered(bookISBN: string) {
  const book = await fetchBookByISBN(bookISBN);
  if (!book) {
    Dialog.create({
      message: t("manageUsers.inStockDialog.errorMessage"),
    });
    return;
  }

  booksToRegister.value.push(book);
}

function retrieveAllBooks() {
  Dialog.create({
    component: RetrieveAllBooksDialog,
  }).onOk(async (/* shouldPrint */) => {
    // TODO: Handle shouldPrint

    const { cache, data: newBookCopies } = await createBookCopies({
      input: {
        ownerId: props.userData.id,
        retailLocationId: selectedLocation.value.id,
        bookIds: booksToRegister.value.map((book) => book.id),
      },
    });

    cache.updateFragment(
      {
        id: cache.identify(props.userData),
        fragment: CustomerFragmentDoc,
        fragmentName: "Customer",
      },
      (data) => {
        if (!data) {
          return;
        }

        return {
          ...data,
          booksInStock: data.booksInStock + booksToRegister.value.length,
        };
      },
    );

    cache.updateQuery(
      {
        query: GetBookCopiesByOwnerDocument,
        variables: {
          userId: props.userData.id,
          retailLocationId: selectedLocation.value.id,
        },
      },
      (data) => {
        if (!data) {
          return;
        }

        return {
          ...data,
          bookCopiesByOwner: [...data.bookCopiesByOwner, ...newBookCopies],
        };
      },
    );

    evictQuery(cache, GetReceiptsDocument, {
      userId: props.userData.id,
      retailLocationId: selectedLocation.value.id,
    });
    cache.gc();

    booksToRegister.value = [];
    tab.value = "retrieved";
  });
}

function openDeleteBookDialog(bookIndex: number) {
  Dialog.create({
    title: t("book.deleteBookDialog.title"),
    message: t("book.deleteBookDialog.message"),
    cancel: t("common.cancel"),
    ok: t("common.delete"),
    persistent: true,
  }).onOk(() => {
    booksToRegister.value.splice(bookIndex, 1);
  });
}

function returnBook(book: BookSummaryFragment) {
  // FIXME: return the book to the Mercatino
  book;
}
</script>

<style lang="scss">
/*
  Adding this to make up for the child element of q-panels
  which is an otherwise inaccessible div
*/
.dialog-panels > .q-panel[role="tabpanel"],
.dialog-panels > * > .q-tab-panel[role="tabpanel"] {
  display: flex;
  overflow: auto;
  height: auto;
}
</style>
