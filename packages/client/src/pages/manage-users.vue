<template>
  <q-page>
    <q-card class="absolute-full column gap-16 no-wrap q-ma-md">
      <q-card-section class="flex-center gap-16 no-wrap row">
        <q-input
          v-model="searchQuery"
          debounce="200"
          class="col search-bar"
          outlined
          :placeholder="$t('common.search')"
          type="text"
        >
          <template #append> <q-icon name="mdi-magnify" /> </template>
        </q-input>

        <q-select
          v-model="filters"
          class="filters-menu"
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

        <span class="col">
          <q-btn
            class="q-ma-sm"
            color="secondary"
            icon="mdi-plus"
            :label="$t('manageUsers.createUser')"
            @click="addNewUser"
          />
        </span>
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
                icon="mdi-pencil"
                round
                size="md"
                @click="openEdit(row, rowIndex)"
              />
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
              @click="openCellEditDialog(row, col)"
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
              @click="openCellEditDialog(row, col)"
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
              @click="openCellEditDialog(row, col)"
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
              @click="openCellEditDialog(row, col)"
            />
          </template>

          <template #header-cell-available="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.available"
            />
          </template>
          <template #body-cell-available="{ value }">
            <table-cell-with-dialog :value="value" show-alert />
          </template>

          <template #body-cell-receipts="{ value }">
            <q-td class="text-center">
              <q-btn
                color="primary"
                flat
                icon="mdi-receipt-text"
                round
                size="md"
                @click="openReceipt(value)"
              />
            </q-td>
          </template>

          <template #body-cell-pay-off="{ value }">
            <q-td class="text-left">
              <!-- This button has the same aspect of a q-chip -->
              <q-btn
                color="primary"
                class="min-height-none q-chip--dense q-chip--square"
                dense
                :label="$t('manageUsers.payOff')"
                @click="openPayOff(value)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { Dialog, QTable, QTableColumn } from "quasar";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import AddNewUserDialog from "src/components/add-new-user-dialog.vue";
import EditUserBooksMovementsDialog from "src/components/manage-users/edit-user-books-movements-dialog.vue";
import EditUserDetailsDialog from "src/components/manage-users/edit-user-details-dialog.vue";
import EditUserRequestedDialog from "src/components/manage-users/edit-user-requested-dialog.vue";
import EditUserStockdataDialog from "src/components/manage-users/edit-user-stockdata-dialog.vue";
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
  inStock: t("manageUsers.toolTips.inStock"),
  sold: t("manageUsers.toolTips.sold"),
  requested: t("manageUsers.toolTips.requested"),
  purchased: t("manageUsers.toolTips.purchased"),
  available: t("manageUsers.toolTips.available"),
}));

const columns = computed(
  () =>
    [
      { name: "edit", field: "edit", label: "" },
      {
        name: "email",
        field: "email",
        label: t("manageUsers.fields.email"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "first-name",
        field: "firstname",
        label: t("manageUsers.fields.firstName"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "last-name",
        field: "lastname",
        label: t("manageUsers.fields.lastName"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "phone-number",
        field: "phoneNumber",
        label: t("manageUsers.fields.phoneNumber"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "in-stock",
        field: "inStock",
        label: t("manageUsers.fields.inStock"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "sold",
        field: "sold",
        label: t("manageUsers.fields.sold"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "requested",
        field: "requested",
        label: t("manageUsers.fields.requested"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "purchased",
        field: "purchased",
        label: t("manageUsers.fields.purchased"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "available",
        field: "available",
        label: t("manageUsers.fields.available"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "creation-date",
        field: "creationDate",
        label: t("manageUsers.fields.creationDate"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "receipts",
        field: "receipts",
        label: t("manageUsers.fields.receipts"),
        headerClasses: "ellipsis",
        align: "left",
        classes: "ellipsis",
      },
      {
        name: "pay-off",
        field: "payOff",
        label: "",
      },
    ] satisfies QTableColumn[],
);

const currentPage = ref(0);

const pagination = ref({
  page: currentPage.value,
  rowsPerPage: 100,
  rowsNumber: users.value.length,
});

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200, 0];

const rawRows = ref<UserFragment[]>([]);

const rows = computed(() =>
  // FIXME: update fields with actual data instead of placeholders
  rawRows.value.map((user, index) => ({
    ...user,
    phoneNumber: Math.random().toFixed(10).slice(2), // This field is already present but its value is not defined in the db yet
    inStock: index % 2,
    purchased: index % 3,
    requested: index % 4,
    sold: index % 5,
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

  pagination.value.rowsNumber = rawRows.value.length;
  pagination.value.page = requestProps.pagination.page;
  pagination.value.rowsPerPage = requestProps.pagination.rowsPerPage;

  loading.value = false;
};

function openReceipt(receipts: string[]) {
  // FIXME: add receipts dialog
  receipts;
}

function openPayOff(payOff: string) {
  // FIXME: add pay-off link
  payOff;
}

function openEdit(
  userData: {
    user: UserFragment;
    newPassword: string;
    confirmPassword: string;
  },
  rowIndex: number,
) {
  Dialog.create({
    component: EditUserDetailsDialog,
    componentProps: { userData },
  }).onOk((payload: { user: UserFragment; password?: string }) => {
    // FIXME: add server call to update user data
    rawRows.value[rowIndex] = payload.user;
  });
}

function openCellEditDialog(userData: UserFragment, column: QTableColumn) {
  switch (column.name) {
    case "inStock":
      Dialog.create({
        component: EditUserStockdataDialog,
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
</script>

<style scoped lang="scss">
.search-bar {
  width: 600px;
}

.filters-menu {
  width: 200px;
}

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
