<template>
  <q-page>
    <q-card class="absolute-full column no-wrap q-ma-md">
      <header-search-bar-filters
        v-model="tableFilter"
        :filter-options="filterOptions"
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
          row-key="id"
          :rows="customers"
          :columns="columns"
          :filter="tableFilter"
          :filter-method="filterMethod"
          :loading="loading"
          :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
          @request="onRequest"
        >
          <template #header-cell-in-stock="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.inStock"
            />
          </template>
          <template #header-cell-sold="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.sold"
            />
          </template>
          <template #header-cell-reserved="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.reserved"
            />
          </template>
          <template #header-cell-requested="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.requested"
            />
          </template>
          <template #header-cell-purchased="{ col }">
            <table-header-with-info
              :label="col.label"
              :info="columnTooltip.purchased"
            />
          </template>

          <template #body="props">
            <q-tr
              :props="props"
              v-bind="
                !props.row.emailVerified
                  ? {
                      class: 'bg-blue-grey-1 text-black-54',
                    }
                  : undefined
              "
            >
              <template v-for="col in props.cols" :key="col.name">
                <q-td v-if="col.name === 'edit'">
                  <q-btn
                    :icon="mdiPencil"
                    color="primary"
                    flat
                    round
                    size="md"
                    @click="openEdit(props.row)"
                  />
                </q-td>

                <q-td v-else-if="col.name === 'firstname'" :class="col.classes">
                  <span class="gap-16 items-center justify-between no-wrap row">
                    {{ col.value }}
                    <q-icon
                      v-if="col.row.notes.length > 0"
                      :name="mdiInformationOutline"
                      size="24px"
                      color="primary"
                    >
                      <q-tooltip>
                        {{ col.row.notes }}
                      </q-tooltip>
                    </q-icon>
                  </span>
                </q-td>

                <table-cell-with-tooltip
                  v-else-if="col.name === 'email'"
                  :class="col.classes"
                  :value="col.value"
                >
                  <template v-if="!props.row.emailVerified">
                    <round-badge
                      class="q-ma-xs"
                      color="warning"
                      float-right
                      text-color="black-87"
                    >
                      <q-icon :name="mdiInformationOutline" size="18px">
                        <q-tooltip>
                          {{ t("auth.emailNotVerified") }}
                        </q-tooltip>
                      </q-icon>
                    </round-badge>
                  </template>
                </table-cell-with-tooltip>

                <table-cell-with-dialog
                  v-else-if="
                    [
                      'in-stock',
                      'sold',
                      'reserved',
                      'requested',
                      'purchased',
                    ].includes(col.name)
                  "
                  :clickable-when-zero="
                    alwaysClickableColsNames.includes(col.name)
                  "
                  :disable="willBeDeleted(props.row)"
                  :secondary-value="
                    col.name === 'requested'
                      ? props.row.booksRequestedAndAvailable
                      : undefined
                  "
                  :value="col.value"
                  @click="openCellEditDialog(props.row, col, col.value)"
                >
                  <template
                    v-if="col.name === 'requested'"
                    #secondary-value="{ value: availableCount }"
                  >
                    <round-badge color="positive">
                      {{ availableCount }}

                      <q-tooltip>
                        {{ $t("manageUsers.tooltips.available") }}
                      </q-tooltip>
                    </round-badge>
                  </template>
                </table-cell-with-dialog>

                <q-td
                  v-else-if="col.name === 'shopping-cart'"
                  :class="col.classes"
                >
                  <q-btn
                    :disable="willBeDeleted(props.row)"
                    :icon="mdiCart"
                    color="primary"
                    flat
                    round
                    @click="openCart(props.row)"
                  >
                    <round-badge
                      v-if="col.value > 0"
                      :label="col.value"
                      class="badge-top-left"
                      color="accent"
                      float-left
                    />
                  </q-btn>
                </q-td>

                <q-td v-else-if="col.name === 'receipts'" :class="col.classes">
                  <q-btn
                    :icon="mdiReceiptText"
                    color="primary"
                    flat
                    round
                    size="md"
                    @click="openReceipt(props.row)"
                  />
                </q-td>

                <q-td v-else-if="col.name === 'pay-off'">
                  <chip-button
                    :disable="
                      !selectedLocation.payOffEnabled ||
                      willBeDeleted(props.row)
                    "
                    color="primary"
                    :label="$t('manageUsers.payOff')"
                    @click="openPayOff(props.row)"
                  >
                    <q-tooltip v-if="!selectedLocation.payOffEnabled">
                      {{ t("manageUsers.payOffDisabled") }}
                    </q-tooltip>
                  </chip-button>
                </q-td>

                <q-td v-else :class="col.classes">
                  {{ col.value }}
                </q-td>
              </template>
            </q-tr>
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
import { Dialog, Notify, QTable, QTableColumn, QTableProps } from "quasar";
import { Ref, computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { UpdateUserPayload } from "src/@generated/graphql";
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
import TableCellWithTooltip from "src/components/manage-users/table-cell-with-tooltip.vue";
import TableHeaderWithInfo from "src/components/manage-users/table-header-with-info.vue";
import { useTableFilters } from "src/composables/use-table-filters";
import { notifyError } from "src/helpers/error-messages";
import { UserDialogPayload } from "src/models/user";
import { useCustomerService } from "src/services/customer";
import { useRetailLocationService } from "src/services/retail-location";
import { useDownloadUserData } from "src/services/user";
import {
  CustomerFragment,
  useAddUserMutation,
  useCancelUserAccountDeletionMutation,
  useDeleteUserAccountMutation,
  useUpdateUserMutation,
} from "src/services/user.graphql";

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

const { filterMethod, filterOptions, tableFilter, refetchFilterProxy } =
  useTableFilters("manageUsers.filters");

onMounted(() => {
  tableRef.value.requestServerInteraction();
});

const onRequest: QTableProps["onRequest"] = async (requested) => {
  await fetchCustomers({
    page: requested.pagination.page,
    rowsPerPage: requested.pagination.rowsPerPage,
    filter: refetchFilterProxy.value,
  });

  pagination.value.rowsNumber = rowsCount.value;
  pagination.value.page = requested.pagination.page;
  pagination.value.rowsPerPage = requested.pagination.rowsPerPage;
};

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
    classes: "max-width-250 ellipsis",
  },
  {
    name: "first-name",
    field: "firstname",
    label: t("manageUsers.fields.firstName"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "last-name",
    field: "lastname",
    label: t("manageUsers.fields.lastName"),
    align: "left",
    classes: "max-width-160 ellipsis",
  },
  {
    name: "phone-number",
    field: "phoneNumber",
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
    align: "center",
  },
  {
    name: "pay-off",
    field: () => undefined,
    label: "",
  },
]);

const { createUser } = useAddUserMutation();
function addNewUser() {
  Dialog.create({
    component: EditUserDetailsDialog,
  }).onOk(async (payload: Extract<UserDialogPayload, { type: "create" }>) => {
    try {
      await createUser({
        input: payload.data,
      });
      await fetchCustomers({
        page: pagination.value.page,
        rowsPerPage: pagination.value.rowsPerPage,
      });
    } catch {
      notifyError(t("auth.couldNotRegister"));
    }
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
  }).onDismiss(() => {
    tableRef.value.requestServerInteraction();
  });
}

const willBeDeleted = (user: CustomerFragment) => !!user.scheduledForDeletionAt;

const { updateUser } = useUpdateUserMutation();
const { downloadData } = useDownloadUserData();
const { deleteUserAccount } = useDeleteUserAccountMutation();
const { cancelUserAccountDeletion } = useCancelUserAccountDeletionMutation();
function openEdit({
  email,
  firstname,
  id,
  lastname,
  discount,
  notes,
  phoneNumber,
  dateOfBirth,
  delegate,
  scheduledForDeletionAt,
}: CustomerFragment) {
  Dialog.create({
    component: EditUserDetailsDialog,
    componentProps: {
      userData: {
        email,
        firstname,
        id,
        lastname,
        discount,
        notes,
        phoneNumber,
        retailLocationId: selectedLocation.value.id,
        dateOfBirth,
        delegate,
      } satisfies UpdateUserPayload,
      scheduledForDeletion: !!scheduledForDeletionAt,
    },
  }).onOk(async (payload: Exclude<UserDialogPayload, { type: "create" }>) => {
    if (payload.type === "toggleDeletion") {
      const shouldDelete = !scheduledForDeletionAt;
      try {
        if (shouldDelete) {
          await deleteUserAccount({ input: { userId: id } });
          Notify.create({
            type: "info",
            message: t("manageUsers.editUser.deleteUserSuccess"),
          });
        } else {
          await cancelUserAccountDeletion({ input: { userId: id } });
          Notify.create({
            type: "info",
            message: t("manageUsers.editUser.cancelUserDeletionSuccess"),
          });
        }
      } catch (error) {
        console.error(error);
        if (shouldDelete) {
          notifyError(t("manageUsers.editUser.deleteUserFailed"));
        } else {
          notifyError(t("manageUsers.editUser.cancelUserDeletionFailed"));
        }
      }
      return;
    }

    if (payload.type === "downloadData") {
      await downloadData(id);
      return;
    }

    const newUserData = payload.data;
    try {
      await updateUser({
        input: {
          ...newUserData,
          email:
            newUserData.email && newUserData.email !== email
              ? newUserData.email
              : email,
          password: newUserData.password ? newUserData.password : undefined,
        },
      });

      await fetchCustomers({
        page: pagination.value.page,
        rowsPerPage: pagination.value.rowsPerPage,
      });
    } catch {
      notifyError(t("auth.couldNotUpdate"));
    }
  });
}

// cells to always be clickable
const alwaysClickableColsNames = ["in-stock", "reserved", "requested"];

const { selectedLocation } = useRetailLocationService();
function openCellEditDialog(
  userData: CustomerFragment,
  { name }: QTableColumn,
  value: number,
) {
  if (
    !selectedLocation.value.id ||
    (value <= 0 && !alwaysClickableColsNames.includes(name))
  ) {
    return;
  }

  switch (name) {
    case "in-stock":
      Dialog.create({
        component: EditUserStockdataDialog,
        componentProps: { userData },
      }).onDismiss(() => {
        tableRef.value.requestServerInteraction();
      });
      break;
    case "reserved":
      Dialog.create({
        component: EditUserReservedDialog,
        componentProps: {
          userData,
          retailLocationId: selectedLocation.value.id,
        },
      })
        .onOk(() => {
          openCart(userData);
        })
        .onDismiss(() => {
          tableRef.value.requestServerInteraction();
        });
      break;
    case "requested":
      Dialog.create({
        component: EditUserRequestedDialog,
        componentProps: {
          userData,
          retailLocationId: selectedLocation.value.id,
        },
      })
        .onOk(() => {
          openCart(userData);
        })
        .onDismiss(() => {
          tableRef.value.requestServerInteraction();
        });
      break;
    case "sold":
    case "purchased": {
      if (value === 0) {
        return;
      }

      Dialog.create({
        component: EditUserBooksMovementsDialog,
        componentProps: { userData, type: name },
      }).onDismiss(() => {
        tableRef.value.requestServerInteraction();
      });
      break;
    }
  }
}

function openCart(user: CustomerFragment) {
  Dialog.create({
    component: CartDialog,
    componentProps: {
      retailLocationId: selectedLocation.value.id,
      user,
    },
  }).onDismiss(() => {
    tableRef.value.requestServerInteraction();
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
