<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters
        v-model:filters="filters"
        v-model:search-query="searchQuery"
      >
        <template #side-actions>
          <q-btn
            class="q-ma-sm"
            color="accent"
            no-wrap
            :icon="mdiPlus"
            :label="$t('manageUsers.createUser')"
            @click="addNewUser"
          />
        </template>
      </header-search-bar-filters>

      <q-card-section class="col no-wrap q-pa-none row">
        <q-table
          ref="tableRef"
          v-model:pagination="pagination"
          class="col"
          flat
          square
          row-key="name"
          :rows="customers"
          :columns="columns"
          :filter="tableFilter"
          :loading="loading"
          :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
          @request="onRequest"
        >
          <template #body-cell-edit="{ row, rowIndex }">
            <q-td class="text-left">
              <q-btn
                color="primary"
                flat
                :icon="mdiPencil"
                round
                size="md"
                @click="openEdit(row, rowIndex)"
              />
            </q-td>
          </template>

          <template #body-cell-first-name="{ value, row }">
            <q-td class="text-left">
              <span class="gap-16 items-center justify-between no-wrap row">
                {{ value }}
                <q-icon
                  v-if="row.notes.length > 0"
                  :name="mdiInformationOutline"
                  size="24px"
                  color="primary"
                >
                  <q-tooltip>
                    {{ row.notes }}
                  </q-tooltip>
                </q-icon>
              </span>
            </q-td>
          </template>

          <!-- Kind of redundant repetition of so much code, can this be reduced? -->
          <template #header-cell-in-stock="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.inStock"
            />
          </template>
          <template #body-cell-in-stock="{ col, row, value }">
            <table-cell-with-dialog
              :value="value"
              @click="openCellEditDialog(row, col, value)"
            />
          </template>

          <template #header-cell-sold="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.sold"
            />
          </template>
          <template #body-cell-sold="{ col, row, value }">
            <table-cell-with-dialog
              :value="value"
              @click="openCellEditDialog(row, col, value)"
            />
          </template>

          <template #header-cell-reserved="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.reserved"
            />
          </template>
          <template #body-cell-reserved="{ col, row, value }">
            <table-cell-with-dialog
              :value="value"
              @click="openCellEditDialog(row, col, value)"
            />
          </template>

          <template #header-cell-requested="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.requested"
            />
          </template>
          <template #body-cell-requested="{ col, row, value }">
            <table-cell-with-dialog
              :value="value"
              :secondary-value="row.booksRequestedAndAvailable"
              @click="openCellEditDialog(row, col, value)"
            >
              <template #secondary-value="{ value: availableCount }">
                <round-badge color="positive">
                  {{ availableCount }}

                  <q-tooltip>
                    {{ $t("manageUsers.tooltips.available") }}
                  </q-tooltip>
                </round-badge>
              </template>
            </table-cell-with-dialog>
          </template>

          <template #header-cell-purchased="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.purchased"
            />
          </template>
          <template #body-cell-purchased="{ col, row, value }">
            <table-cell-with-dialog
              :value="value"
              @click="openCellEditDialog(row, col, value)"
            />
          </template>

          <template #body-cell-shopping-cart="{ row, value }">
            <q-td class="text-center">
              <q-btn
                :icon="mdiCart"
                color="primary"
                flat
                round
                @click="openCart(row)"
              >
                <round-badge
                  v-if="value > 0"
                  :label="value"
                  class="badge-top-left"
                  color="accent"
                  float-left
                />
              </q-btn>
            </q-td>
          </template>

          <template #body-cell-receipts="{ row }">
            <q-td class="text-center">
              <q-btn
                color="primary"
                flat
                :icon="mdiReceiptText"
                round
                size="md"
                @click="openReceipt(row)"
              />
            </q-td>
          </template>

          <template #body-cell-pay-off="{ row }">
            <q-td>
              <chip-button
                color="primary"
                :label="$t('manageUsers.payOff')"
                @click="openPayOff(row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiCart,
  mdiInformationOutline,
  mdiPencil,
  mdiPlus,
  mdiReceiptText,
} from "@quasar/extras/mdi-v7";
import { Dialog, QTable, QTableColumn, QTableProps } from "quasar";
import { Ref, computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import AddNewUserDialog from "src/components/add-new-user-dialog.vue";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import CartDialog from "src/components/manage-users/cart-dialog.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import EditUserBooksMovementsDialog from "src/components/manage-users/edit-user-books-movements-dialog.vue";
import EditUserDetailsDialog from "src/components/manage-users/edit-user-details-dialog.vue";
import EditUserRequestedDialog from "src/components/manage-users/edit-user-requested-dialog.vue";
import EditUserReservedDialog from "src/components/manage-users/edit-user-reserved-dialog.vue";
import EditUserStockdataDialog from "src/components/manage-users/edit-user-stockdata-dialog.vue";
import PayOffUserDialog from "src/components/manage-users/pay-off-user-dialog.vue";
import ReceiptsDialog from "src/components/manage-users/receipts-dialog.vue";
import RoundBadge from "src/components/manage-users/round-badge.vue";
import TableCellWithDialog from "src/components/manage-users/table-cell-with-dialog.vue";
import TableHeaderWithInfo from "src/components/manage-users/table-header-with-info.vue";
import { useCustomerService } from "src/services/customer";
import { CustomerFragment } from "src/services/user.graphql";

const tableRef = ref() as Ref<QTable>;

const { t, locale } = useI18n();

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200, 0];

const {
  customers,
  rowsCount,
  loading,
  fetch: fetchCustomers,
} = useCustomerService();

const pagination = ref({
  page: 1,
  rowsPerPage: 100,
  rowsNumber: rowsCount.value,
});

const onRequest: QTableProps["onRequest"] = async (requested) => {
  await fetchCustomers({
    page: requested.pagination.page,
    rowsPerPage: requested.pagination.rowsPerPage,
    searchTerm: tableFilter.value?.searchTerm,
    // TODO: pass the filters to the server
  });

  pagination.value.rowsNumber = rowsCount.value;
  pagination.value.page = requested.pagination.page;
  pagination.value.rowsPerPage = requested.pagination.rowsPerPage;
};

onMounted(() => {
  tableRef.value.requestServerInteraction();
});

const searchQuery = ref("");
const filters = ref<UserFilters[]>([]);

enum UserFilters {
  withAvailable,
  withRequested,
  withPurchased,
  withSold,
}

// TODO: send the filters to the server
const tableFilter = computed(() =>
  !searchQuery.value && filters.value.length === 0
    ? undefined
    : { searchTerm: searchQuery.value, filters: filters.value },
);

const columnTooltip = computed(() => ({
  inStock: t("manageUsers.tooltips.inStock"),
  sold: t("manageUsers.tooltips.sold"),
  reserved: t("manageUsers.tooltips.reserved"),
  requested: t("manageUsers.tooltips.requested"),
  purchased: t("manageUsers.tooltips.purchased"),
  available: t("manageUsers.tooltips.available"),
}));

const columns = computed<QTableColumn<CustomerFragment>[]>(() => [
  { name: "edit", field: () => undefined, label: "" },
  {
    name: "email",
    field: "email",
    label: t("manageUsers.fields.email"),
    align: "left",
  },
  {
    name: "first-name",
    field: "firstname",
    label: t("manageUsers.fields.firstName"),
    align: "left",
  },
  {
    name: "last-name",
    field: "lastname",
    label: t("manageUsers.fields.lastName"),
    align: "left",
  },
  {
    name: "phone-number",
    // field: "phoneNumber",
    field: () => Math.random().toFixed(10).slice(2), // This field is already present but its value is not defined in the db yet
    label: t("manageUsers.fields.phoneNumber"),
    align: "left",
  },
  {
    name: "in-stock",
    field: "booksInStock",
    label: t("manageUsers.fields.inStock"),
    align: "left",
  },
  {
    name: "sold",
    field: "booksSold",
    label: t("manageUsers.fields.sold"),
    align: "left",
  },
  {
    name: "reserved",
    field: "booksReserved",
    label: t("manageUsers.fields.reserved"),
    align: "left",
  },
  {
    name: "requested",
    field: "booksRequested",
    label: t("manageUsers.fields.requested"),
    align: "left",
  },
  {
    name: "purchased",
    field: "booksBought",
    label: t("manageUsers.fields.purchased"),
    align: "left",
  },
  {
    name: "shopping-cart",
    field: "booksInCart",
    label: t("manageUsers.fields.cart"),
    align: "center",
  },
  {
    name: "creation-date",
    field: "createdAt",
    format: (val: string) =>
      new Date(val)
        .toLocaleDateString(locale.value === "it" ? "it-IT" : "en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .split(", ")
        .join(" - "),
    label: t("manageUsers.fields.creationDate"),
    align: "left",
  },
  {
    name: "receipts",
    field: () => undefined,
    label: t("manageUsers.fields.receipts"),
    align: "left",
  },
  {
    name: "pay-off",
    field: () => undefined,
    label: "",
  },
]);

function addNewUser() {
  Dialog.create({
    component: AddNewUserDialog,
  }).onOk((payload) => {
    // FIXME: add new user
    payload;
  });
}

function openReceipt(user: CustomerFragment) {
  Dialog.create({
    component: ReceiptsDialog,
    componentProps: {
      user,
    },
  });
}

function openPayOff(user: CustomerFragment) {
  Dialog.create({
    component: PayOffUserDialog,
    componentProps: {
      user,
    },
  }).onOk((payload) => {
    // FIXME: add checkout logic
    payload;
  });
}

function openEdit(user: CustomerFragment, rowIndex: number) {
  Dialog.create({
    component: EditUserDetailsDialog,
    componentProps: { userData: user },
  }).onOk((payload: { user: CustomerFragment; password?: string }) => {
    // FIXME: add server call to update user data
    customers.value[rowIndex] = payload.user;
  });
}

function openCellEditDialog(
  userData: CustomerFragment,
  column: QTableColumn,
  value: number,
) {
  if (value === 0) {
    return;
  }

  switch (column.name) {
    case "in-stock":
      Dialog.create({
        component: EditUserStockdataDialog,
        componentProps: { userData },
      });
      break;
    case "reserved":
      Dialog.create({
        component: EditUserReservedDialog,
        componentProps: { userData },
      });
      break;
    case "requested":
      Dialog.create({
        component: EditUserRequestedDialog,
        componentProps: { userData },
      });
      break;
    case "sold":
    case "purchased":
      Dialog.create({
        component: EditUserBooksMovementsDialog,
        componentProps: { userData, type: column.name },
      });
      break;
  }
}

function openCart(user: CustomerFragment) {
  Dialog.create({
    component: CartDialog,
    componentProps: { user },
  });
}
</script>

<style scoped lang="scss">
// This is the suggested way from Quasar docs; simply adding
// the css to the element doesn't work and there is no table
// property to make the thead sticky otherwise
:deep(thead) {
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: #fff;
}
</style>
