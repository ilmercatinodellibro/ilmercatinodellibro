<template>
  <q-page class="justify-center q-pa-xl row">
    <q-card class="col-grow column max-width-1024 relative">
      <q-card-section class="justify-end row">
        <q-input v-model="search" dense :label="t(`common.search`)" outlined>
          <template #append>
            <q-icon
              :name="mdiMagnify"
              color="black-54"
              class="cursor-pointer"
            />
          </template>
        </q-input>
        <q-btn class="q-ml-sm" color="black-12" outline @click="addUser">
          <span class="text-black-87">
            <q-icon :name="mdiAccountPlus" />
            {{ t("actions.addNewUser") }}
          </span>
        </q-btn>
      </q-card-section>
      <q-separator color="black-12" />
      <q-card-section v-if="!loading" class="column">
        <span
          v-for="user in filteredUserList"
          :key="user.id"
          class="items-center min-height-52 q-my-sm row"
        >
          <span class="col-3">
            <q-icon
              class="q-mr-sm"
              :name="mdiAccountCircle"
              color="secondary"
              size="sm"
            />

            {{ `${user.firstname} ${user.lastname}` }}
          </span>
          <span class="col items-center justify-center q-ml-md text-black-54">
            {{ user.email }}
          </span>
          <q-select
            :model-value="user.role"
            :options="ROLE_TYPE_OPTIONS"
            class="col-2"
            color="secondary"
            outlined
            dense
            map-options
            @update:model-value="(value) => updateUser(user.id, value.value)"
          />
          <q-btn
            class="q-ml-md"
            color="black-12"
            outline
            dense
            padding="xs sm"
            no-caps
            @click="deleteUser(user.id)"
          >
            <span class="text-black-87">{{ t("actions.remove") }}</span>
          </q-btn>
        </span>
      </q-card-section>
      <q-card-section v-else class="col items-center justify-center row">
        <q-spinner size="xl" />
      </q-card-section>
      <span
        v-if="filteredUserList.length === 0"
        class="absolute-center items-center justify-center text-black-54 text-subtitle1"
      >
        {{ t("general.noSearchResults") }}
      </span>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiAccountCircle,
  mdiAccountPlus,
  mdiMagnify,
} from "@quasar/extras/mdi-v5";
import { Dialog, Notify } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Role } from "src/@generated/graphql";
import AddNewUserDialog from "src/components/add-new-user-dialog.vue";
import ConfirmDialog from "src/components/confirm-dialog.vue";
import { notifyError } from "src/helpers/error-messages";
import { ServerError } from "src/models/server";
import { useSendRegistrationInviteMutation } from "src/services/auth.graphql";
import { useMembersService } from "src/services/member";
import { useRetailLocationService } from "src/services/retail-location";

const { t } = useI18n();

const search = ref("");

const { members, loading, removeUser, updateRole } = useMembersService();

const { sendRegistrationInvite } = useSendRegistrationInviteMutation();

const ROLE_TYPE_OPTIONS = computed(() =>
  (["ADMIN", "OPERATOR"] satisfies Role[]).map((type) => ({
    label: t(`roleMap.${type}`),
    value: type,
  })),
);

const filteredUserList = computed(() =>
  members.value.filter((user) =>
    `${user.firstname} ${user.lastname} ${user.email}`
      .toLowerCase()
      .includes(search.value.toLowerCase()),
  ),
);

async function updateUser(id: string, role: Role) {
  try {
    await updateRole(id, role);
    Notify.create({
      message: t("general.userRoleUpdated"),
      color: "positive",
    });
  } catch (e) {
    const { message, status } = e as ServerError;

    // TODO: implement centralized error handling

    notifyError(message);

    if (![401, 422].includes(status)) {
      throw e;
    }
  }
}

function deleteUser(id: string) {
  Dialog.create({
    component: ConfirmDialog,
    componentProps: {
      title: t("actions.removeUser"),
      message: t("general.removeUserMessage"),
      ok: t("actions.remove"),
    },
  }).onOk(async () => {
    try {
      await removeUser(id);
      Notify.create({
        message: t("general.userRemoved"),
        color: "positive",
      });
    } catch (e) {
      const { message, status } = e as ServerError;

      // TODO: implement centralized error handling

      notifyError(message);

      if (![401, 422].includes(status)) {
        throw e;
      }
    }
  });
}

const { selectedLocation } = useRetailLocationService();
function addUser() {
  Dialog.create({
    component: AddNewUserDialog,
    componentProps: {
      title: t("actions.addUser"),
    },
  }).onOk(async (email: string) => {
    try {
      await sendRegistrationInvite({
        input: {
          email,
          retailLocationId: selectedLocation.value.id,
        },
      });
      Notify.create({
        message: t("general.inviteSent"),
        color: "positive",
      });
    } catch (e) {
      const { message, status } = e as ServerError;

      // TODO: implement centralized error handling

      notifyError(message);

      if (![401, 422].includes(status)) {
        throw e;
      }
    }
  });
}
</script>
