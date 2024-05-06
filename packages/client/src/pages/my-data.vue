<template>
  <q-page>
    <q-card class="absolute-full flex-center q-ma-md row">
      <q-card-section class="column no-padding width-min-360">
        <q-list>
          <q-item
            v-for="{ icon, label, field, showInfo, infoLabel } in userData"
            :key="label"
          >
            <q-item-section side>
              <q-icon :name="icon" color="primary" />
            </q-item-section>

            <q-item-section class="column">
              <span class="text-subtitle1">
                {{ label }}
              </span>

              <span class="text-black-54">
                {{ typeof field === "function" ? field(user!) : user![field] }}
              </span>
            </q-item-section>

            <q-item-section v-if="showInfo" side>
              <q-icon :name="mdiInformationOutline" color="black-54">
                <q-tooltip>
                  {{ infoLabel }}
                </q-tooltip>
              </q-icon>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator />

        <q-btn
          :label="t('auth.editMyData')"
          class="q-mb-xl q-mt-md"
          color="primary"
          @click="modifyUserData()"
        />

        <q-separator />

        <q-btn
          :label="t('auth.deleteAccount')"
          class="q-mt-xl"
          color="accent"
          @click="deleteAccount()"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  mdiAccount,
  mdiAccountTie,
  mdiCakeVariant,
  mdiInformationOutline,
  mdiMail,
  mdiPhone,
} from "@quasar/extras/mdi-v7";
import { Dialog, date } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { UpdateUserPayload } from "src/@generated/graphql";
import DeleteAccountDialog from "src/components/delete-account-dialog.vue";
import EditUserDataDialog from "src/components/edit-user-data-dialog.vue";
import { notifyError } from "src/helpers/error-messages";
import { useAuthService } from "src/services/auth";
import { CurrentUserFragment } from "src/services/auth.graphql";
import { useRetailLocationService } from "src/services/retail-location";
import {
  UserFragmentDoc,
  useUpdateUserMutation,
} from "src/services/user.graphql";

const { t } = useI18n();

const { user, updateCurrentUser } = useAuthService();

interface ItemData {
  icon: string;
  label: string;
  field: keyof CurrentUserFragment | ((row: CurrentUserFragment) => string);
  showInfo?: boolean;
  infoLabel?: string;
}

const userData = computed<ItemData[]>(() => [
  {
    icon: mdiAccount,
    label: t("auth.firstName"),
    field: "firstname",
  },
  {
    icon: mdiAccount,
    label: t("auth.lastName"),
    field: "lastname",
  },
  {
    icon: mdiCakeVariant,
    label: t("auth.birthDate"),
    field: ({ dateOfBirth }) =>
      dateOfBirth ? date.formatDate(new Date(dateOfBirth), "DD MMM YYYY") : "",
  },
  {
    icon: mdiAccountTie,
    label: t("auth.nameOfDelegate"),
    field: "delegate",
    showInfo: true,
    infoLabel: t("auth.delegateLabel"),
  },
  {
    icon: mdiMail,
    label: t("auth.emailAddress"),
    field: "email",
  },
  {
    icon: mdiPhone,
    label: t("auth.phoneNumber"),
    field: "phoneNumber",
  },
]);

const { updateUser } = useUpdateUserMutation();
const { selectedLocation } = useRetailLocationService();
function modifyUserData() {
  Dialog.create({
    component: EditUserDataDialog,
  }).onOk(async (newUserData: UpdateUserPayload) => {
    if (!user.value) {
      return;
    }

    try {
      const { cache } = await updateUser({
        input: {
          ...newUserData,
          id: user.value.id,
          retailLocationId: selectedLocation.value.id,
        },
      });

      cache.updateFragment(
        {
          fragment: UserFragmentDoc,
          fragmentName: "UserSummary",
          id: cache.identify(user.value),
        },
        (data) => {
          if (!data) {
            return;
          }
          return {
            ...data,
            ...newUserData,
            discount: newUserData.discount ?? false,
          };
        },
      );

      updateCurrentUser(newUserData);
    } catch {
      notifyError(t("auth.couldNotUpdate"));
    }
  });
}

function deleteAccount() {
  Dialog.create({
    component: DeleteAccountDialog,
  }).onOk(() => {
    // FIXME: add deletion of the user's account and log out
  });
}
</script>
