<template>
  <header-bar v-if="user" />
  <q-page class="contacts-container">
    <q-card class="contacts-card">
      <span class="contacts-title text-primary">
        {{ $t("contacts.title") }}
      </span>
      <div class="contacts-wrapper">
        <span class="contacts-text">
          <i18n-t keypath="contacts.text">
            <template #email>
              <span class="contacts-mail">
                <a
                  href="mailto:info@ilmercatinodellibro.com"
                  class="contacts-details text-secondary"
                  rel="noopener"
                  target="_blank"
                >
                  {{ "info@ilmercatinodellibro.com" }}
                </a>
              </span>
            </template>
          </i18n-t>
        </span>
        <span class="contacts-text text-secondary">
          <a
            :href="'tel:+39' + selectedLocation.phoneNumber"
            class="contacts-details text-secondary"
          >
            {{ formatPhone(selectedLocation.phoneNumber) }}
          </a>
        </span>
        <span class="contacts-subtext text-black-54">
          {{ $t("contacts.subtext") }}
        </span>
        <q-separator class="black-12" />
        <span class="contacts-text"> {{ $t("contacts.findUs") }} </span>
        <div>
          <social-button
            :link="selectedLocation.facebookLink"
            name="facebook"
            class="q-mb-sm"
          />
          <social-button
            :link="selectedLocation.instagramLink"
            name="instagram"
          />
        </div>
      </div>
    </q-card>
    <q-card class="contacts-card form-card">
      <span class="form-title">
        {{ $t("contacts.form.title") }}
      </span>
      <span class="form-content">
        <q-input
          v-for="(key, field) in userParam"
          :key="field"
          v-model="userParam[field]"
          outlined
          :label="$t('contacts.form.' + field)"
          class="black-54 form-text"
          :input-class="field === 'message' ? 'form-textarea' : ''"
          :type="field === 'message' ? 'textarea' : 'text'"
          bottom-slots
        >
          <template #hint>
            <span class="text-hint">
              {{ userHints[field] }}
            </span>
          </template>
        </q-input>
        <q-btn
          color="secondary"
          :label="$t('contacts.form.send')"
          class="form-button"
        />
      </span>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import SocialButton from "src/components/social-button.vue";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

const HeaderBar = defineAsyncComponent(
  () => import("src/components/header-bar.vue"),
);

const userParam = ref({
  firstname: "",
  lastname: "",
  email: "",
  message: "",
});

const { isAuthenticated, user } = useAuthService();
if (isAuthenticated.value && user.value) {
  userParam.value.firstname = user.value.firstname;
  userParam.value.lastname = user.value.lastname;
  userParam.value.email = user.value.email;
}

const userHints = ref({
  firstname: "",
  lastname: "",
  email: "",
  message: "",
});

const { selectedLocation } = useRetailLocationService();

function formatPhone(unformattedNumber: string | undefined) {
  if (!unformattedNumber) {
    return "";
  }

  const firtPart = unformattedNumber.slice(0, 3);
  const secondPart = unformattedNumber.slice(3, 6);
  const thirdPart = unformattedNumber.slice(6, 10);

  return `${firtPart} ${secondPart} ${thirdPart}`;
}
</script>

<style scoped lang="scss">
.contacts {
  &-container {
    align-items: stretch;
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    height: min-content;
    justify-content: center;
    margin: 0 24px;
  }

  &-card {
    align-items: center;
    align-self: center;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    gap: 48px;
    height: 100%;
    min-height: 622px;
    padding: 24px;
    width: 500px;
  }

  &-wrapper {
    align-content: center;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &-title {
    font-size: 48px;
    line-height: 57px;
  }

  &-text {
    font-size: 24px;
    line-height: 28px;
    text-align: center;
  }

  &-details {
    word-break: break-all;
  }

  &-mail {
    display: block;
    line-height: 76px;
  }

  &-subtext {
    font-size: 16px;
    line-height: 28px;
    text-align: center;
  }
}

.form {
  &-card {
    align-items: stretch;
    gap: 24px;
  }

  &-title {
    font-size: 24px;
    line-height: 28px;
    text-align: center;
  }

  &-content {
    align-items: stretch;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    flex-grow: 2;
    gap: 16px;
    width: 100%;
  }

  &-text {
    width: 100%;
  }

  &-button {
    width: 100%;
  }
}

.text-hint {
  height: 16px;
}

:global(.form-textarea) {
  height: 190px;
  resize: none !important;
}

:global(.q-field__bottom) {
  height: 16px;
  min-height: 0;
}

:global(.q-field--with-bottom) {
  padding-bottom: 16px;
}

:global(.q-field__control) {
  border-radius: 8px !important;
}
</style>
