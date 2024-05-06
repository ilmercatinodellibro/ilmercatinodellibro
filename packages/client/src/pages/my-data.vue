<template>
  <q-page>
    <q-card class="absolute-full flex-center q-ma-md row">
      <q-card-section class="column no-padding width-min-360">
        <q-list>
          <q-item
            v-for="{
              icon,
              label,
              value,
              showInfo,
              format,
              infoLabel,
            } in userData"
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
                {{
                  format && typeof value === "string" ? format(value) : value
                }}
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
  mdiLock,
  mdiMail,
  mdiPhone,
} from "@quasar/extras/mdi-v7";
import { Dialog } from "quasar";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { UpdateUserPayload } from "src/@generated/graphql";
import DeleteAccountDialog from "src/components/delete-account-dialog.vue";
import EditUserDataDialog from "src/components/edit-user-data-dialog.vue";
import { notifyError } from "src/helpers/error-messages";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";
import {
  UserFragment,
  UserFragmentDoc,
  useUpdateUserMutation,
} from "src/services/user.graphql";

const { t } = useI18n();

const { user, updateCurrentUser } = useAuthService();

interface ItemData {
  icon: string;
  label: string;
  value: UserFragment[keyof UserFragment];
  showInfo?: boolean;
  infoLabel?: string;
  format?: (value?: string) => string | undefined;
}

const userData = computed<ItemData[]>(() => [
  {
    icon: mdiAccount,
    label: t("auth.firstName"),
    value: user.value?.firstname,
  },
  {
    icon: mdiAccount,
    label: t("auth.lastName"),
    value: user.value?.lastname,
  },
  {
    icon: mdiCakeVariant,
    label: t("auth.birthDate"),
    // TODO: add the field
    value: undefined,
  },
  {
    icon: mdiAccountTie,
    label: t("auth.nameOfDelegate"),
    // TODO: add the field
    value: undefined,
    showInfo: true,
    infoLabel: t("auth.delegateLabel"),
  },
  {
    icon: mdiMail,
    label: t("auth.emailAddress"),
    value: user.value?.email,
  },
  {
    icon: mdiPhone,
    label: t("auth.phoneNumber"),
    value: user.value?.phoneNumber,
  },
  {
    icon: mdiLock,
    label: t("auth.password"),
    // TODO: add the field
    value: undefined,
    format: (value) => value?.replace(/./g, "*"),
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
