<template>
  <q-dialog ref="dialogRef" full-width full-height @hide="onDialogHide">
    <k-dialog-card
      :title="
        $t('manageUsers.payOffUserDialog.title', [
          `${user.firstname} ${user.lastname}`,
        ])
      "
    >
      <q-card-section class="gap-16 items-center no-wrap q-pa-md row">
        <q-input
          :model-value="soldCopies.length"
          :label="$t('manageUsers.payOffUserDialog.soldBooksCountLabel')"
          outlined
          readonly
        />
        <q-input
          :label="$t('manageUsers.payOffUserDialog.totalPayOffLabel')"
          :model-value="totalCheckoutMoney.toFixed(2)"
          outlined
          readonly
          suffix="€"
        />
        <q-input
          :label="$t('manageUsers.payOffUserDialog.totalCheckedOutLabel')"
          :model-value="totalCheckedOutMoney.toFixed(2)"
          outlined
          readonly
          suffix="€"
        />

        <q-space />

        <q-icon :name="mdiInformationOutline" color="black-54" size="24px" />
        {{ $t("manageUsers.payOffUserDialog.info") }}
      </q-card-section>

      <q-card-section class="col-grow column height-0 no-wrap q-pa-none">
        <dialog-table
          :columns="columns"
          :loading="bookLoading"
          :rows="
            // We handle the group header in the #body slot, so it's safe to use a type that is different than the columns definition
            tableRows as readonly BookCopyDetailsFragment[]
          "
        >
          <template #header-cell-buy-price>
            <table-header-with-info
              :info="$t('manageUsers.payOffUserDialog.buyPriceTooltip')"
              :label="$t('manageUsers.payOffUserDialog.buyPrice')"
            />
          </template>

          <template #header-cell-public-price>
            <table-header-with-info
              :info="$t('manageUsers.payOffUserDialog.publicPriceTooltip')"
              :label="$t('manageUsers.payOffUserDialog.publicPrice')"
            />
          </template>

          <!-- Body slot is used because we need to split the table into 3 parts -->
          <template #body="{ row, cols }">
            <q-tr
              v-if="Object.values(Titles).includes(row.id)"
              class="bg-grey-1"
              no-hover
            >
              <q-td auto-width>
                <q-checkbox
                  v-if="row.id === Titles.InStock"
                  :disable="selectableRows.length === 0"
                  :model-value="rowsSelectionStatus"
                  dense
                  @update:model-value="swapAllRows()"
                />
              </q-td>
              <!--
                This <td> takes all the remaining columns of the table's worth of width
                so the colspan is set to take up the space of all the other columns
              -->
              <q-td class="non-selectable text-weight-medium" colspan="11">
                <span class="items-center row">
                  {{ localizedSectionTitle(row.id) }}
                  <q-space />
                  <span
                    v-if="
                      rowsSelectionStatus !== false && row.id === Titles.InStock
                    "
                    class="gap-16 items-center row sticky-button-group"
                  >
                    <q-btn
                      :label="
                        $t('manageUsers.payOffUserDialog.returnOptions.donate')
                      "
                      outline
                      @click="donateBooks(selectedRows)"
                    />
                    <q-btn
                      :label="
                        $t(
                          'manageUsers.payOffUserDialog.returnOptions.reimburse',
                        )
                      "
                      outline
                      @click="reimburseBooks(selectedRows)"
                    />
                    <q-btn
                      :label="
                        $t('manageUsers.payOffUserDialog.returnOptions.return')
                      "
                      color="positive"
                      @click="returnBooks(selectedRows)"
                    />
                    <q-btn
                      :label="
                        $t('manageUsers.booksMovementsDialog.reportProblem')
                      "
                      color="negative"
                      @click="reportProblems(selectedRows)"
                    />
                  </span>
                </span>
              </q-td>
            </q-tr>

            <q-tr v-else-if="row.id === 'EMPTY'" no-hover>
              <q-td auto-width />

              <q-td class="text-left" colspan="11">
                {{ t("bookErrors.noBookCopy") }}
              </q-td>
            </q-tr>

            <q-tr v-else>
              <q-td v-for="col in cols" :key="col.name" :class="col.classes">
                <!--
                  Since we can't use #body-cell-[column-name] because we're using
                  the #body slot, we have to use v-if on the col.name instead
                -->
                <q-checkbox
                  v-if="col.name === 'select' && selectableRows.includes(row)"
                  :model-value="
                    selectedRows.map(({ id }) => id).includes(row.id)
                  "
                  dense
                  @update:model-value="swapRow(row)"
                />

                <q-btn
                  v-else-if="
                    col.name === 'actions' &&
                    ownedCopies.includes(row) &&
                    !['donated', 'reimbursed'].includes(getStatus(row))
                  "
                  :icon="mdiDotsVertical"
                  dense
                  flat
                  round
                  size="sm"
                >
                  <q-menu auto-close>
                    <q-item
                      v-if="selectableRows.includes(row)"
                      class="items-center"
                      clickable
                      @click="returnBooks([row])"
                    >
                      {{
                        $t("manageUsers.payOffUserDialog.returnOptions.return")
                      }}
                    </q-item>
                    <q-item
                      v-if="selectableRows.includes(row)"
                      class="items-center"
                      clickable
                      @click="donateBooks([row])"
                    >
                      {{
                        $t("manageUsers.payOffUserDialog.returnOptions.donate")
                      }}
                    </q-item>
                    <q-item
                      class="items-center"
                      clickable
                      @click="reimburseBooks([row])"
                    >
                      {{
                        $t(
                          "manageUsers.payOffUserDialog.returnOptions.reimburse",
                        )
                      }}
                    </q-item>
                    <q-item
                      v-if="selectableRows.includes(row)"
                      class="items-center"
                      clickable
                      @click="reportProblems([row])"
                    >
                      {{ $t("manageUsers.booksMovementsDialog.reportProblem") }}
                    </q-item>
                  </q-menu>
                </q-btn>
                <span v-else>
                  <q-tooltip v-if="['subject', 'author'].includes(col.name)">
                    {{ col.value }}
                  </q-tooltip>
                  {{ col.value }}
                </span>
              </q-td>
            </q-tr>
          </template>
        </dialog-table>
      </q-card-section>

      <template #card-actions>
        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />
        <q-btn
          :disable="selectableRows.length === 0"
          outline
          :label="$t('manageUsers.payOffUserDialog.returnAndDonate')"
          @click="returnAllBooks('REFUND')"
        />
        <q-btn
          color="green"
          :disable="selectableRows.length === 0"
          :label="
            $t('manageUsers.payOffUserDialog.returnEverything', [
              totalCheckoutMoney.toFixed(2),
            ])
          "
          @click="returnAllBooks('RETURN')"
        />
      </template>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiDotsVertical, mdiInformationOutline } from "@quasar/extras/mdi-v7";
import { cloneDeep, sumBy } from "lodash-es";
import {
  Dialog,
  QDialog,
  QTableColumn,
  useDialogPluginComponent,
} from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { SettleRemainingType } from "src/@generated/graphql";
import KDialogCard from "src/components/k-dialog-card.vue";
import { formatPrice } from "src/composables/use-misc-formats";
import { discountedPrice, getStatus } from "src/helpers/book-copy";
import { notifyError } from "src/helpers/error-messages";
import {
  BookCopyDetailsFragment,
  ProblemDetailsFragment,
  useDonateBookCopyMutation,
  useGetBookCopiesByOwnerQuery,
  useGetReturnedBookCopiesQuery,
  useGetSoldBookCopiesQuery,
  useReimburseBookCopyMutation,
  useReportProblemMutation,
  useReturnBookCopyMutation,
} from "src/services/book-copy.graphql";
import { BookSummaryFragment } from "src/services/book.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import { UserFragment, useSettleUserMutation } from "src/services/user.graphql";
import DialogTable from "./dialog-table.vue";
import ProblemsDialog from "./problems-dialog.vue";
import ReturnBooksConfirmDialog from "./return-books-confirm-dialog.vue";
import TableHeaderWithInfo from "./table-header-with-info.vue";

const { t } = useI18n();

const props = defineProps<{
  user: UserFragment;
}>();

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
  useDialogPluginComponent<SettleRemainingType>();

const columns = computed<QTableColumn<BookCopyDetailsFragment>[]>(() => [
  {
    name: "select",
    field: () => undefined,
    label: "",
  },
  {
    name: "isbn-code",
    field: ({ book }) => book.isbnCode,
    label: t("book.fields.isbn"),
    align: "left",
  },
  {
    name: "book-code",
    field: "code",
    label: t("book.code"),
    align: "left",
  },
  {
    name: "status",
    field: getStatus,
    label: t("book.fields.status"),
    align: "left",
    format: (_, row) =>
      t(
        `warehouse.bookCopyStatus.${selectableRows.value.includes(row) ? "inStock" : getStatus(row)}`,
      ),
  },
  {
    name: "author",
    field: ({ book }) => book.authorsFullName,
    label: t("book.fields.author"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "publisher",
    field: ({ book }) => book.publisherName,
    label: t("book.fields.publisher"),
    align: "left",
  },
  {
    name: "subject",
    field: ({ book }) => book.subject,
    label: t("book.fields.subject"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "title",
    field: ({ book }) => book.title,
    label: t("book.fields.title"),
    align: "left",
    classes: "text-wrap",
  },
  {
    name: "cover-price",
    field: ({ book }) => book.originalPrice,
    label: t("book.fields.price"),
    align: "left",
    format: formatPrice,
  },
  {
    name: "buy-price",
    field: ({ book }) => book.originalPrice,
    label: t("manageUsers.payOffUserDialog.buyPrice"),
    align: "left",
    format: (val: number) => discountedPrice(val, "buy"),
  },
  {
    name: "public-price",
    field: ({ book }) => book.originalPrice,
    label: t("manageUsers.payOffUserDialog.publicPrice"),
    align: "left",
    format: (val: number) => discountedPrice(val, "sell"),
  },
  {
    name: "actions",
    field: () => undefined,
    label: "",
  },
]);

const { selectedLocation } = useRetailLocationService();

const {
  bookCopiesByOwner: ownedCopies,
  loading: ownedLoading,
  refetch: refetchBookCopiesByOwner,
} = useGetBookCopiesByOwnerQuery(() => ({
  userId: props.user.id,
  retailLocationId: selectedLocation.value.id,
}));

const {
  returnedBookCopies: returnedCopies,
  loading: returnedLoading,
  refetch: refetchReturnedBookCopes,
} = useGetReturnedBookCopiesQuery(() => ({
  userId: props.user.id,
  retailLocationId: selectedLocation.value.id,
}));

const { soldBookCopies: soldCopies, loading: soldLoading } =
  useGetSoldBookCopiesQuery(() => ({
    userId: props.user.id,
    retailLocationId: selectedLocation.value.id,
  }));

const getSettledOrToSettleCopiesPriceSum = (
  settledAt: number | null | undefined,
  book: BookSummaryFragment,
  settled: boolean,
) =>
  (settled ? settledAt : !settledAt)
    ? (book.originalPrice *
        (props.user.discount
          ? selectedLocation.value.buyRate
          : selectedLocation.value.sellRate)) /
      100
    : 0;

const totalCheckoutMoney = computed(() =>
  sumBy(ownedCopies.value, ({ settledAt, book }) =>
    getSettledOrToSettleCopiesPriceSum(settledAt, book, false),
  ),
);
const totalCheckedOutMoney = computed(() =>
  sumBy(ownedCopies.value, ({ settledAt, book }) =>
    getSettledOrToSettleCopiesPriceSum(settledAt, book, true),
  ),
);

const bookLoading = computed(
  () => ownedLoading.value || returnedLoading.value || soldLoading.value,
);

enum Titles {
  InStock = "in-stock",
  Returned = "returned",
  Sold = "sold",
}
interface GroupHeaderRow {
  id: Titles;
}
interface EmptyRow {
  id: "EMPTY";
}
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getCodeIndex = (code: string) => parseInt(code.split("/")[0]!);
const sortByCopyCode = (copies: BookCopyDetailsFragment[]) =>
  [...copies].sort((copyA, copyB) =>
    getCodeIndex(copyA.code) < getCodeIndex(copyB.code)
      ? -1
      : getCodeIndex(copyA.code) === getCodeIndex(copyB.code)
        ? 0
        : 1,
  );

const tableRows = computed<
  (BookCopyDetailsFragment | GroupHeaderRow | EmptyRow)[]
>(() => [
  // Adding one empty row for each of the sub-headers, then merging all the
  // separate rows into the same array to display them all in a single table
  {
    id: Titles.InStock,
  },
  ...(ownedCopies.value.length > 0
    ? sortByCopyCode(ownedCopies.value)
    : [{ id: "EMPTY" } satisfies EmptyRow]),

  {
    id: Titles.Returned,
  },
  ...(returnedCopies.value.length > 0
    ? sortByCopyCode(returnedCopies.value)
    : [{ id: "EMPTY" } satisfies EmptyRow]),

  {
    id: Titles.Sold,
  },
  ...(soldCopies.value.length > 0
    ? sortByCopyCode(soldCopies.value)
    : [{ id: "EMPTY" } satisfies EmptyRow]),
]);

const selectableRows = computed(() =>
  ownedCopies.value.filter((row) => getStatus(row) === "available"),
);

const selectedRows = ref<BookCopyDetailsFragment[]>([]);

const localizedSectionTitle = (sectionTitle: Titles) =>
  sectionTitle === Titles.InStock
    ? t("manageUsers.payOffUserDialog.booksInStock")
    : sectionTitle === Titles.Returned
      ? t("manageUsers.payOffUserDialog.returnedBooks")
      : t("manageUsers.payOffUserDialog.soldBooks");

const rowsSelectionStatus = computed(() =>
  selectedRows.value.length === 0
    ? false
    : selectedRows.value.length === selectableRows.value.length
      ? true
      : undefined,
);

function swapAllRows() {
  selectedRows.value =
    selectedRows.value.length > 0 ? [] : cloneDeep(selectableRows.value);
}

function swapRow(row: BookCopyDetailsFragment) {
  if (selectedRows.value.map(({ id }) => id).includes(row.id)) {
    selectedRows.value.splice(selectedRows.value.indexOf(row), 1);
  } else {
    selectedRows.value.push(row);
  }
}

function removeBookCopiesAfterAction(bookCopies: BookCopyDetailsFragment[]) {
  if (bookCopies.length > 0) {
    selectedRows.value = [];
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    selectedRows.value.splice(selectedRows.value.indexOf(bookCopies[0]!));
  }
}

const { returnBookCopy } = useReturnBookCopyMutation();
async function returnBooks(bookCopies: BookCopyDetailsFragment[]) {
  try {
    await Promise.all(
      bookCopies.map(({ id: bookCopyId }) =>
        returnBookCopy({
          input: {
            bookCopyId,
            retailLocationId: selectedLocation.value.id,
          },
        }),
      ),
    );

    const queryArgs = {
      retailLocationId: selectedLocation.value.id,
      userId: props.user.id,
    };
    await Promise.all([
      refetchBookCopiesByOwner(queryArgs),
      refetchReturnedBookCopes(queryArgs),
    ]);
    removeBookCopiesAfterAction(bookCopies);
  } catch {
    notifyError(
      t(`bookErrors.not${bookCopies.length > 1 ? "All" : ""}Returned`),
    );
  }
}

async function donateBookCopies(bookCopies: BookCopyDetailsFragment[]) {
  try {
    await Promise.all(
      bookCopies.map(({ id: bookCopyId }) =>
        donateBookCopy({
          input: {
            bookCopyId,
            retailLocationId: selectedLocation.value.id,
          },
        }),
      ),
    );
    await refetchBookCopiesByOwner({
      retailLocationId: selectedLocation.value.id,
      userId: props.user.id,
    });
    removeBookCopiesAfterAction(bookCopies);
  } catch {
    notifyError(
      t(`bookErrors.not${bookCopies.length > 1 ? "All" : ""}Donated`),
    );
  }
}

const { donateBookCopy } = useDonateBookCopyMutation();
function donateBooks(bookCopies: BookCopyDetailsFragment[]) {
  Dialog.create({
    title: t(
      "manageUsers.payOffUserDialog.confirms.donate.title",
      bookCopies.length,
    ),
    message: `${t(
      "manageUsers.payOffUserDialog.confirms.donate.label",
      bookCopies.length,
    )} ${t("manageUsers.payOffUserDialog.confirms.disclaimer")}`,
    ok: t(
      "manageUsers.payOffUserDialog.confirms.donate.confirmLabel",
      bookCopies.length,
    ),
    cancel: t("common.cancel"),
    persistent: true,
  }).onOk(async () => {
    await donateBookCopies(bookCopies);
  });
}

const { reimburseBookCopy } = useReimburseBookCopyMutation();
function reimburseBooks(bookCopies: BookCopyDetailsFragment[]) {
  Dialog.create({
    title: t(
      "manageUsers.payOffUserDialog.confirms.reimburse.title",
      bookCopies.length,
    ),
    message: `${t(
      "manageUsers.payOffUserDialog.confirms.reimburse.label",
      bookCopies.length,
    )} ${t("manageUsers.payOffUserDialog.confirms.disclaimer")}`,
    ok: t(
      "manageUsers.payOffUserDialog.confirms.reimburse.confirmLabel",
      bookCopies.length,
    ),
    cancel: t("common.cancel"),
    persistent: true,
  }).onOk(async () => {
    try {
      await Promise.all(
        bookCopies.map(({ id: bookCopyId }) =>
          reimburseBookCopy({
            input: {
              bookCopyId,
              retailLocationId: selectedLocation.value.id,
            },
          }),
        ),
      );
      await refetchBookCopiesByOwner({
        retailLocationId: selectedLocation.value.id,
        userId: props.user.id,
      });
      removeBookCopiesAfterAction(bookCopies);
    } catch {
      notifyError(
        t(`bookErrors.not${bookCopies.length > 1 ? "All" : ""}reimbursed`),
      );
    }
  });
}

const { reportProblem } = useReportProblemMutation();
function reportProblems(bookCopies: BookCopyDetailsFragment[]) {
  Dialog.create({
    component: ProblemsDialog,
    componentProps: {
      bookCopy: bookCopies[0],
    },
  }).onOk(async ({ details, type }: ProblemDetailsFragment) => {
    try {
      await Promise.all(
        bookCopies.map(({ id: bookCopyId }) =>
          reportProblem({
            input: {
              bookCopyId,
              details,
              type,
            },
          }),
        ),
      );
      await refetchBookCopiesByOwner({
        retailLocationId: selectedLocation.value.id,
        userId: props.user.id,
      });
      removeBookCopiesAfterAction(bookCopies);
    } catch {
      notifyError(t("manageUsers.payOffUserDialog.problemsError"));
    }
  });
}

const { settleUser } = useSettleUserMutation();
function returnAllBooks(remainingType: SettleRemainingType) {
  const translationsPath = `manageUsers.payOffUserDialog.confirms.${
    remainingType === "REFUND" ? "returnAndDonate" : "returnEverything"
  }`;
  Dialog.create({
    component: ReturnBooksConfirmDialog,
    componentProps: {
      booksToReturn: selectableRows.value,
      disclaimer: t(`${translationsPath}.disclaimer`),
      saveLabel: t(
        `manageUsers.payOffUserDialog.${
          remainingType === "REFUND"
            ? "confirms.returnAndDonate.buttonText"
            : "returnEverything"
        }`,
        [totalCheckoutMoney.value.toFixed(2)],
      ),
      tableTitle: t(`${translationsPath}.tableTitle`),
      title: t(
        `manageUsers.payOffUserDialog.${
          remainingType === "RETURN"
            ? "returnAndDonate"
            : "confirms.returnEverything.title"
        }`,
      ),
      booksSoldToOthers: soldCopies.value.length,
      totalCheckoutMoney: totalCheckoutMoney.value,
      totalCheckedOutMoney: totalCheckedOutMoney.value,
    },
  }).onOk(async () => {
    try {
      await settleUser({
        input: {
          remainingType,
          retailLocationId: selectedLocation.value.id,
          userId: props.user.id,
        },
      });
    } catch {
      notifyError(t("common.genericErrorMessage"));
    }
    onDialogOK();
  });
}
</script>

<style scoped lang="scss">
// This class is used so that the bulk action buttons
// can be seen without scrolling the table to the right
.sticky-button-group {
  position: sticky;
  right: 16px;
}
</style>
