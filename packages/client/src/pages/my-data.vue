<template>
  <q-page>
    <q-card class="absolute-full flex-center q-ma-md row">
      <q-card-section class="column no-padding width-360">
        <q-list>
          <q-item
            v-for="{ icon, label, value, showInfo, format } in userData"
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
                {{ format ? format(value) : value }}
              </span>
            </q-item-section>

            <q-item-section v-if="showInfo" side>
              <q-icon :name="mdiInformationOutline" color="black-54">
                <q-tooltip>
                  {{ t("auth.delegateLabel") }}
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
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthService } from "src/services/auth";
import { UserFragment } from "src/services/user.graphql";

const { t } = useI18n();

const { user } = useAuthService();

type ItemData = {
  icon: string;
  label: string;
} & ({ showInfo?: false } | { showInfo: true; infoLabel: string }) & {
    value: UserFragment[keyof UserFragment];
  } & {
    value?: string;
    format?: (value?: string) => string | undefined;
  };

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
    // TODO: add the field
    value: undefined,
  },
  {
    icon: mdiLock,
    label: t("auth.password"),
    // TODO: add the field
    value: undefined,
    format: (value) => value?.replace(/./g, "*"),
  },
]);

function modifyUserData() {
  // FIXME: open dialog
}

function deleteAccount() {
  // FIXME: open dialog
}
</script>
