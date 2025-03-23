<template>
  <q-page>
    <q-card
      :class="!isMobile ? 'q-ma-md' : ''"
      class="absolute-full column no-wrap"
    >
      <header-search-bar-filters
        v-model="tableFilter"
        :filter-options="filterOptions"
      >
        <template #side-actions>
          <q-btn
            :class="isMobile ? 'full-width' : 'q-ma-sm'"
            color="accent"
            no-wrap
            :icon="mdiPlus"
            :label="t('manageUsers.createUser')"
            @click="addNewUser"
          />
        </template>
      </header-search-bar-filters>

      <q-card-section class="col no-wrap q-pa-none row">
        <q-table
          ref="tableRef"
          v-model:pagination="pagination"
          :class="isMobile ? 'sticky-last-column' : ''"
          :columns="columns"
          :filter="tableFilter"
          :filter-method="filterMethod"
          :loading="loading"
          :rows="customers"
          :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
          class="col"
          flat
          square
          row-key="id"
          @request="onRequest"
        >
          <template #header-cell-in-stock="props">
            <table-header-with-info
              :props
              :label="props.col.label"
              :info="columnTooltip.inStock"
            />
          </template>
          <template #header-cell-sold="props">
            <table-header-with-info
              :props
              :label="props.col.label"
              :info="columnTooltip.sold"
            />
          </template>
          <template #header-cell-reserved="props">
            <table-header-with-info
              :props
              :label="props.col.label"
              :info="columnTooltip.reserved"
            />
          </template>
          <template #header-cell-requested="props">
            <table-header-with-info
              :props
              :label="props.col.label"
              :info="columnTooltip.requested"
            />
          </template>
          <template #header-cell-purchased="props">
            <table-header-with-info
              :props
              :label="props.col.label"
              :info="columnTooltip.purchased"
            />
          </template>

          <template #body="props">
            <q-tr
              :props
              :class="
                !props.row.emailVerified ? 'bg-blue-grey-1 text-black-54' : ''
              "
            >
              <q-td key="edit" :props>
                <q-btn
                  :icon="mdiPencil"
                  color="primary"
                  flat
                  round
                  size="md"
                  @click="openEdit(props.row)"
                />
              </q-td>

              <table-cell-with-tooltip
                key-td="email"
                :props
                :value="getColValue(props.cols, 'email')"
              >
                <template v-if="!props.row.emailVerified">
                  <round-badge
                    class="q-ma-xs"
                    color="warning"
                    float-right
                    text-color="black-87"
                  >
                    <q-icon :name="mdiInformationOutline" size="xs">
                      <q-tooltip>
                        {{ t("auth.emailNotVerified") }}
                      </q-tooltip>
                    </q-icon>
                  </round-badge>
                </template>
              </table-cell-with-tooltip>

              <q-td key="first-name" :props>
                <span class="gap-16 items-center justify-between no-wrap row">
                  {{ getColValue(props.cols, "first-name") }}
                  <q-icon
                    v-if="props.row.notes.length > 0"
                    :name="mdiInformationOutline"
                    size="sm"
                    color="primary"
                  >
                    <q-tooltip>
                      {{ props.row.notes }}
                    </q-tooltip>
                  </q-icon>
                </span>
              </q-td>

              <q-td key="last-name" :props>
                {{ getColValue(props.cols, "last-name") }}
              </q-td>

              <q-td key="phone-number" :props>
                {{ getColValue(props.cols, "phone-number") }}
              </q-td>

              <!-- `key` is needed for the v-for, `key-td` is needed for `QTable` -->
              <table-cell-with-dialog
                v-for="colName in [
                  'in-stock',
                  'sold',
                  'reserved',
                  'requested',
                  'purchased',
                ]"
                :key="colName"
                :key-td="colName"
                :props
                :clickable-when-zero="
                  alwaysClickableColsNames.includes(colName)
                "
                :disable="willBeDeleted(props.row)"
                :secondary-value="
                  colName === 'requested'
                    ? props.row.booksRequestedAndAvailable
                    : undefined
                "
                :value="getColValue(props.cols, colName)"
                @click="
                  openCellEditDialog(
                    props.row,
                    colName,
                    getColValue(props.cols, colName),
                  )
                "
              >
                <template
                  v-if="colName === 'requested'"
                  #secondary-value="{ value: availableCount }"
                >
                  <round-badge color="positive">
                    {{ availableCount }}

                    <q-tooltip>
                      {{ t("manageUsers.tooltips.available") }}
                    </q-tooltip>
                  </round-badge>
                </template>
              </table-cell-with-dialog>

              <q-td key="shopping-cart" :props>
                <q-btn
                  :disable="willBeDeleted(props.row)"
                  :icon="mdiCart"
                  color="primary"
                  flat
                  round
                  @click="openCart(props.row)"
                >
                  <round-badge
                    v-if="getColValue(props.cols, 'shopping-cart') > 0"
                    :label="getColValue(props.cols, 'shopping-cart')"
                    class="badge-top-left"
                    color="accent"
                    float-left
                  />
                </q-btn>
              </q-td>

              <q-td key="creation-date" :props>
                {{ getColValue(props.cols, "creation-date") }}
              </q-td>

              <q-td key="receipts" :props>
                <q-btn
                  :icon="mdiReceiptText"
                  color="primary"
                  flat
                  round
                  size="md"
                  @click="openReceipt(props.row)"
                />
              </q-td>

              <q-td key="pay-off" :props>
                <chip-button
                  :disable="
                    !hasAdminRole &&
                    (!selectedLocation.payOffEnabled ||
                      willBeDeleted(props.row))
                  "
                  color="primary"
                  :label="t('manageUsers.payOff')"
                  @click="openPayOff(props.row)"
                >
                  <q-tooltip v-if="!selectedLocation.payOffEnabled">
                    {{ t("manageUsers.payOffDisabled") }}
                  </q-tooltip>
                </chip-button>
              </q-td>

              <!-- Mobile actions button -->
              <q-td key="actions" :props>
                <actions-list-button>
                  <q-item v-close-popup clickable @click="openEdit(props.row)">
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.editUser.title") }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    :disable="willBeDeleted(props.row)"
                    clickable
                    @click="
                      openCellEditDialog(
                        props.row,
                        'in-stock',
                        props.row.booksInStock,
                      )
                    "
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.fields.inStock") }} ({{
                          props.row.booksInStock
                        }})
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-if="props.row.booksSold > 0"
                    v-close-popup
                    :disable="willBeDeleted(props.row)"
                    clickable
                    @click="
                      openCellEditDialog(props.row, 'sold', props.row.booksSold)
                    "
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.fields.sold") }} ({{
                          props.row.booksSold
                        }})
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    :disable="willBeDeleted(props.row)"
                    clickable
                    @click="
                      openCellEditDialog(
                        props.row,
                        'reserved',
                        props.row.booksReserved,
                      )
                    "
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.fields.reserved") }} ({{
                          props.row.booksReserved
                        }})
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    :disable="willBeDeleted(props.row)"
                    clickable
                    @click="
                      openCellEditDialog(
                        props.row,
                        'requested',
                        props.row.booksRequested,
                      )
                    "
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.fields.requested") }} ({{
                          props.row.booksRequested
                        }})
                      </q-item-label>
                    </q-item-section>

                    <q-item-section
                      v-if="props.row.booksRequestedAndAvailable > 0"
                      side
                    >
                      <round-badge color="positive">
                        <q-item-label>
                          {{ props.row.booksRequestedAndAvailable }}
                        </q-item-label>

                        <q-tooltip>
                          {{ t("manageUsers.tooltips.available") }}
                        </q-tooltip>
                      </round-badge>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-if="props.row.booksBought > 0"
                    v-close-popup
                    :disable="willBeDeleted(props.row)"
                    clickable
                    @click="
                      openCellEditDialog(
                        props.row,
                        'purchased',
                        props.row.booksBought,
                      )
                    "
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.fields.purchased") }} ({{
                          props.row.booksBought
                        }})
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    :disable="willBeDeleted(props.row)"
                    clickable
                    @click="openCart(props.row)"
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.fields.cart") }} ({{
                          props.row.booksInCart
                        }})
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    clickable
                    @click="openReceipt(props.row)"
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.fields.receipts") }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    :disable="
                      !hasAdminRole &&
                      (!selectedLocation.payOffEnabled ||
                        willBeDeleted(props.row))
                    "
                    clickable
                    @click="openPayOff(props.row)"
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ t("manageUsers.payOff") }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </actions-list-button>
              </q-td>
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
import ActionsListButton from "src/components/actions-list-button.vue";
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
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { useTableFilters } from "src/composables/use-table-filters";
import { notifyError } from "src/helpers/error-messages";
import { getColValue } from "src/helpers/table-helpers";
import { UserDialogPayload } from "src/models/user";
import { useAuthService } from "src/services/auth";
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

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100, 200, 0];

const { t, locale } = useI18n();

const { hasAdminRole } = useAuthService();

const { isMobile } = useLateralDrawer();

const tableRef = ref() as Ref<QTable>;

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

// The "satisfies QTableColumn<...>" is needed to avoid a TS mismatch caused by `computed` type
const columns = computed<QTableColumn<CustomerFragment>[]>(() => [
  ...((!isMobile.value
    ? [{ name: "edit", field: () => undefined, label: "" }]
    : []) satisfies QTableColumn<CustomerFragment>[]),
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
  ...(selectedLocation.value.maxBookingDays > 0
    ? [
        {
          name: "reserved",
          field: "booksReserved",
          label: t("manageUsers.fields.reserved"),
          align: "left",
        } satisfies QTableColumn<CustomerFragment>,
      ]
    : []),
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
  ...((!isMobile.value
    ? [
        {
          name: "shopping-cart",
          field: "booksInCart",
          label: t("manageUsers.fields.cart"),
          align: "center",
        },
      ]
    : []) satisfies QTableColumn<CustomerFragment>[]),
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
  ...((!isMobile.value
    ? [
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
      ]
    : [
        {
          name: "actions",
          field: () => undefined,
          label: "",
          classes: ({ emailVerified }) =>
            `no-padding ${
              !emailVerified ? "bg-blue-grey-1 text-black-54" : ""
            }`,
        },
      ]) satisfies QTableColumn<CustomerFragment>[]),
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
  emailVerified,
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
        emailVerified,
      },
      scheduledForDeletion: !!scheduledForDeletionAt,
    } satisfies InstanceType<typeof EditUserDetailsDialog>["$props"],
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

          // TODO: Add a way to log out the corresponding user if their email gets updated (and now unverified)
          // This is unlikely to happen so it's left to a future implementation for now
          email:
            newUserData.email && newUserData.email !== email
              ? newUserData.email
              : undefined,
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
  colName: string,
  value: number,
) {
  if (
    !selectedLocation.value.id ||
    (value <= 0 && !alwaysClickableColsNames.includes(colName))
  ) {
    return;
  }

  switch (colName) {
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
        componentProps: { userData, type: colName },
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
  z-index: 2;
  top: 0;
  background-color: #fff;
}

.sticky-last-column {
  tr:last-child th:last-child,
  td:last-child {
    border-left: 1px solid rgba(0 0 0 / 12%);
    position: sticky;
    right: 0;
    z-index: 1;
  }
}
</style>
