<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <q-card-section class="flex-center gap-16 no-wrap row">
        <q-input
          v-model="searchQuery"
          debounce="200"
          class="width-600"
          outlined
          :placeholder="$t('common.search')"
          type="text"
        >
          <template #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </q-input>

        <q-select
          v-model="filters"
          class="width-200"
          multiple
          outlined
          :options="options.map(({ key }) => key)"
          :label="$t('book.filter')"
        >
          <!--
            This is because the filters are translated and if a user were to switch
            language they should update so the key for each filter is an integer ID
            and the label is what's shown in the filter UI
          -->
          <template v-if="filters.length > 0" #selected>
            {{ selectedFiltersToString }}
          </template>

          <template #option="{ itemProps, opt, selected, toggleOption }">
            <q-item v-bind="itemProps" class="non-selectable">
              <q-item-section side top>
                <q-checkbox
                  :model-value="selected"
                  @update:model-value="toggleOption(opt)"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label> {{ options[opt]?.label }} </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-space />

        <q-btn
          class="q-ma-sm"
          color="accent"
          no-wrap
          :icon="mdiPlus"
          :label="$t('manageUsers.createUser')"
          @click="addNewUser"
        />
      </q-card-section>

      <q-card-section class="col no-wrap q-pa-none row">
        <q-table
          ref="tableRef"
          v-model:pagination="pagination"
          class="col"
          flat
          square
          row-key="name"
          :rows="rows"
          :columns="columns"
          :filter="searchQuery"
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
            <!-- FIXME: add actual value logic -->
            <table-cell-with-dialog
              :value="value"
              :secondary-value="getAvailableCount(row)"
              @click="openCellEditDialog(row, col, value)"
            />
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

          <template #body-cell-shopping-cart="{ row }">
            <q-td class="text-center">
              <q-btn
                :icon="mdiCart"
                color="primary"
                flat
                round
                @click="openCart(row)"
              >
                <round-badge
                  :label="getAvailableCount(row)"
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
  mdiMagnify,
  mdiPencil,
  mdiPlus,
  mdiReceiptText,
} from "@quasar/extras/mdi-v7";
import { Dialog, QTable, QTableColumn } from "quasar";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import AddNewUserDialog from "src/components/add-new-user-dialog.vue";
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
import { useTranslatedFilters } from "src/composables/use-filter-translations";
import { UserFragment, useUsersQuery } from "src/services/user.graphql";

const { loading, users, refetch } = useUsersQuery();

const tableRef = ref<QTable>();

const { t, locale } = useI18n();

const searchQuery = ref("");
const filters = ref<UserFilters[]>([]);

enum UserFilters {
  withAvailable,
  withRequested,
  withPurchased,
  withSold,
}

const options = useTranslatedFilters<UserFilters>("manageUsers.filters");

const columnTooltip = computed(() => ({
  inStock: t("manageUsers.tooltips.inStock"),
  sold: t("manageUsers.tooltips.sold"),
  reserved: t("manageUsers.tooltips.reserved"),
  requested: t("manageUsers.tooltips.requested"),
  purchased: t("manageUsers.tooltips.purchased"),
  available: t("manageUsers.tooltips.available"),
}));

// TODO: pass the actual row type to QTable column's generic parameter when the data is available
const columns = computed<QTableColumn<(typeof rows.value)[number]>[]>(() => [
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
    field: "phoneNumber",
    label: t("manageUsers.fields.phoneNumber"),
    align: "left",
  },
  {
    name: "in-stock",
    field: "inStock",
    label: t("manageUsers.fields.inStock"),
    align: "left",
  },
  {
    name: "sold",
    field: "sold",
    label: t("manageUsers.fields.sold"),
    align: "left",
  },
  {
    name: "reserved",
    field: "reserved",
    label: t("manageUsers.fields.reserved"),
    align: "left",
  },
  {
    name: "requested",
    field: "requested",
    label: t("manageUsers.fields.requested"),
    align: "left",
  },
  {
    name: "purchased",
    field: "purchased",
    label: t("manageUsers.fields.purchased"),
    align: "left",
  },
  {
    name: "shopping-cart",
    // FIXME: add field
    field: () => undefined,
    label: t("manageUsers.fields.cart"),
    align: "center",
  },
  {
    name: "creation-date",
    field: "creationDate",
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

const currentPage = ref(0);

const pagination = ref({
  page: currentPage.value,
  rowsPerPage: 100,
  rowsNumber: users.value.length,
});

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200, 0];

const rawRows = ref<UserFragment[]>([]);

// TODO: Instead of transforming the data here, use field/format fields of column definitions when the data is available
const rows = computed(() =>
  // FIXME: update fields with actual data instead of placeholders
  rawRows.value.map((user, index) => ({
    ...user,
    phoneNumber: Math.random().toFixed(10).slice(2), // This field is already present but its value is not defined in the db yet
    inStock: index % 2,
    purchased: index % 3,
    requested: index % 4,
    sold: index % 5,
    reserved: (index % 2) + 1,
    available: (index + 1) % 2,
    creationDate: new Date()
      .toLocaleDateString(locale.value === "it" ? "it-IT" : "en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .split(", ")
      .join(" - "),
  })),
);

onMounted(() => {
  updateTable();
});

const selectedFiltersToString = computed(() =>
  filters.value.map((key) => options.value[key]?.label).join(", "),
);

watch(filters, () => {
  updateTable();
});

function addNewUser() {
  Dialog.create({
    component: AddNewUserDialog,
  }).onOk((payload) => {
    // FIXME: add new user
    payload;
  });
}

const onRequest: QTable["onRequest"] = async function (requestProps) {
  loading.value = true;

  const payload = await refetch();

  // FIXME: reserve this filtering to the actual query
  rawRows.value.splice(
    0,
    rawRows.value.length,
    ...(payload?.data.users.filter(
      (row) =>
        row.role === "USER" &&
        Object.values(row).some((value) =>
          searchQuery.value
            ? typeof value === "string" && value.includes(searchQuery.value)
            : true,
        ),
    ) ?? []),
  );

  pagination.value.rowsNumber = rawRows.value.length; // FIXME: update to correct rowsNumber
  pagination.value.page = requestProps.pagination.page;
  pagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;

  loading.value = false;
};

function openReceipt(user: UserFragment) {
  Dialog.create({
    component: ReceiptsDialog,
    componentProps: {
      user,
    },
  });
}

function openPayOff(user: UserFragment) {
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

function openEdit(user: UserFragment, rowIndex: number) {
  Dialog.create({
    component: EditUserDetailsDialog,
    componentProps: { userData: user },
  }).onOk((payload: { user: UserFragment; password?: string }) => {
    // FIXME: add server call to update user data
    rawRows.value[rowIndex] = payload.user;
  });
}

function openCellEditDialog(
  userData: UserFragment,
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
    // Only other two remaining cases, could be in 'default:' instead
    case "sold":
    case "purchased":
      Dialog.create({
        component: EditUserBooksMovementsDialog,
        componentProps: { userData, type: column.name },
      });
  }
}

function updateTable() {
  tableRef.value?.requestServerInteraction();
}

function getAvailableCount(user: UserFragment) {
  // FIXME: add logic for available books count
  user;
  return 1;
}

function openCart(user: UserFragment) {
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
