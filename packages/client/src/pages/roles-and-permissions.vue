<template>
  <q-page>
    <q-card
      :class="!isMobile ? 'q-ma-md' : undefined"
      class="absolute-full column no-wrap"
    >
      <header-search-bar-filters
        v-model="tableFilter"
        :filter-options="filterOptions"
      >
        <template #side-actions>
          <q-btn
            :class="isMobile ? 'col' : ''"
            :icon="mdiPlus"
            :label="t('general.rolesAndPermissions.addNewOperator.title')"
            color="accent"
            @click="addUser()"
          />
        </template>
      </header-search-bar-filters>

      <q-separator color="black-12" />

      <q-card-section v-if="!loading" class="col column no-padding no-wrap">
        <dialog-table
          v-model:pagination="pagination"
          :class="isMobile ? 'sticky-last-column' : undefined"
          :columns="columns"
          :filter="tableFilter"
          :filter-method="filterMethod"
          :loading="loading"
          :rows="members"
          class="col flex-delegate-height-management"
          @request="onRequest"
        >
          <template #body-cell-actions="{ row, col }">
            <q-td
              :class="[col.classes, isMobile ? 'no-padding' : undefined]"
              auto-width
            >
              <template v-if="row.role !== 'ADMIN'">
                <chip-button
                  v-if="!isMobile"
                  :label="t('actions.removeOperator')"
                  color="negative"
                  @click="deleteUser(row.id)"
                />

                <q-btn
                  v-else
                  :icon="mdiDotsVertical"
                  class="fit"
                  color="primary"
                  flat
                >
                  <q-menu>
                    <q-list>
                      <q-item
                        v-close-popup
                        clickable
                        @click="deleteUser(row.id)"
                      >
                        <q-item-section>
                          <q-item-label>
                            {{ t("actions.removeOperator") }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>
            </q-td>
          </template>
        </dialog-table>
      </q-card-section>

      <q-card-section v-else class="col items-center justify-center row">
        <q-spinner size="xl" />
      </q-card-section>

      <span
        v-if="members.length === 0"
        class="absolute-center items-center justify-center text-black-54 text-subtitle1"
      >
        {{ t("general.noSearchResults") }}
      </span>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ApolloError } from "@apollo/client";
import { mdiDotsVertical, mdiPlus } from "@quasar/extras/mdi-v7";
import { Dialog, Notify, QTableColumn, QTableProps } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Role } from "src/@generated/graphql";
import { evictQuery } from "src/apollo/cache";
import AddNewUserDialog from "src/components/add-new-user-dialog.vue";
import ConfirmDialog from "src/components/confirm-dialog.vue";
import HeaderSearchBarFilters from "src/components/header-search-bar-filters.vue";
import ChipButton from "src/components/manage-users/chip-button.vue";
import DialogTable from "src/components/manage-users/dialog-table.vue";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { useTableFilters } from "src/composables/use-table-filters";
import { notifyError } from "src/helpers/error-messages";
import { useAddOrInviteOperatorMutation } from "src/services/auth.graphql";
import { useMembersService } from "src/services/member";
import { useRetailLocationService } from "src/services/retail-location";
import {
  GetMembersDocument,
  MemberFragment,
  useGetMembersQuery,
} from "src/services/user.graphql";
const { isMobile } = useLateralDrawer();

const { t } = useI18n();

const { selectedLocation } = useRetailLocationService();
const { loading, removeMember } = useMembersService();
const { members, refetch: refetchMembers } = useGetMembersQuery(() => ({
  retailLocationId: selectedLocation.value.id,
}));

const pagination = ref({
  rowsNumber: members.value.length,
});

const { filterMethod, filterOptions, tableFilter, refetchFilterProxy } =
  useTableFilters("general.rolesAndPermissions.filters");

const { addOrInviteOperator } = useAddOrInviteOperatorMutation();

const onRequest: QTableProps["onRequest"] = async () => {
  try {
    await refetchMembers({
      retailLocationId: selectedLocation.value.id,
      filters: refetchFilterProxy.value,
    });
    pagination.value.rowsNumber = members.value.length;
  } catch (error) {
    console.error(error);
  }
};

const columns = computed<QTableColumn<MemberFragment>[]>(() => [
  {
    field: "firstname",
    label: t("auth.firstName"),
    name: "first-name",
    align: "left",
  },
  {
    field: "lastname",
    label: t("auth.lastName"),
    name: "last-name",
    align: "left",
  },
  {
    field: "email",
    label: t("auth.email"),
    name: "email",
    align: "left",
  },
  {
    field: "role",
    label: t("general.role"),
    name: "role",
    align: "left",
    format: (val: Role) => t(`roleMap.${val}`),
  },
  {
    field: () => undefined,
    label: "",
    name: "actions",
    align: "center",
  },
]);

function deleteUser(id: string) {
  Dialog.create({
    component: ConfirmDialog,
    componentProps: {
      title: t("actions.removeOperator"),
      message: t("general.removeUserMessage"),
      ok: t("actions.remove"),
    },
  }).onOk(async () => {
    try {
      await removeMember(id);

      Notify.create({
        message: t("general.userRemoved"),
        color: "positive",
      });

      pagination.value.rowsNumber--;
    } catch (e) {
      const { message } = e as ApolloError;

      // TODO: implement centralized error handling

      notifyError(message);
    }
  });
}

function addUser() {
  Dialog.create({
    component: AddNewUserDialog,
  }).onOk(async (email: string) => {
    try {
      const { cache, data: newUser } = await addOrInviteOperator({
        email,
        retailLocationId: selectedLocation.value.id,
      });

      Notify.create({
        message: newUser
          ? t("general.rolesAndPermissions.operatorAdded")
          : t("general.inviteSent"),
        color: "positive",
      });

      if (newUser) {
        evictQuery(cache, GetMembersDocument);
        pagination.value.rowsNumber++;
        cache.gc();
      }
    } catch (e) {
      const { message } = e as ApolloError;

      // TODO: implement centralized error handling

      notifyError(message);
    }
  });
}
</script>
