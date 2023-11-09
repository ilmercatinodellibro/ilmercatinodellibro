<template>
  <q-page class="contacts-container">
    <q-card class="contacts-card">
      <span class="contacts-title text-primary">
        {{ $t("contacts.title") }}
      </span>
      <div class="contacts-wrapper">
        <span class="contacts-text"> {{ $t("contacts.text[0]") }} </span>
        <span class="contacts-text">
          <a
            href="mailto:info@ilmercatinodellibro.com"
            class="contacts-details text-secondary"
          >
            {{ "info@ilmercatinodellibro.com" }}
          </a>
        </span>
        <span class="contacts-text"> {{ $t("contacts.text[1]") }} </span>
        <span class="contacts-text text-secondary">
          <a
            :href="'tel:+39' + phoneNumber"
            class="contacts-details text-secondary"
          >
            {{ formatPhone(phoneNumber) }}
          </a>
        </span>
        <span class="contacts-subtext text-black-54">
          {{ $t("contacts.text[2]") }}
        </span>
        <q-separator class="black-12" />
        <span class="contacts-text"> {{ $t("contacts.findUs") }} </span>
        <div class="contacts-socials">
          <a v-for="index in 2" :key="index" :href="socials[index - 1]">
            <q-btn outline no-caps color="primary" class="socials-button">
              <span class="button-container">
                <q-icon
                  class="button-icon"
                  color="primary"
                  :name="
                    'svguse:icons.svg#' + (index - 1 ? 'instagram' : 'facebook')
                  "
                />
                <span class="button-text-container">
                  <span class="button-text">
                    {{ index - 1 ? "Instagram" : "Facebook" }}
                  </span>
                  <q-icon
                    class="button-icon"
                    color="black-54"
                    name="mdi-arrow-right"
                  />
                </span>
              </span>
            </q-btn>
          </a>
          <!--
            q-btn outline no-caps color="primary" class="socials-button">
            <span class="button-container">
            <q-icon
            class="button-icon"
            color="primary"
            name="svguse:icons.svg#instagram"
            />
            <span class="button-text-container">
            <span class="button-text"> {{ "Instagram" }} </span>
            <q-icon
            class="button-icon"
            name="mdi-arrow-right"
            color="black-54"
            />
            </span>
            </span>
            </q-btn
          -->
        </div>
      </div>
    </q-card>
    <q-card class="contacts-card form-card">
      <span class="form-title">
        {{ $t("contacts.form.title") }}
      </span>
      <span class="form-content">
        <q-input
          v-for="(key, field) in user"
          :key="field"
          v-model="user[field]"
          outlined
          :label="$t('contacts.form.' + field)"
          class="black-54 form-text"
          :input-class="field === 'message' ? 'form-textarea' : ''"
          :type="field === 'message' ? 'textarea' : 'text'"
          bottom-slots
        >
          <template #hint>
            <span class="text-hint">
              {{ hints[field as keyof typeof hints] }}
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
import { ref } from "vue";

let userParam = {
  name: "Monkey",
  surname: "Dream",
  email: "mojo@dreamonkey.com",
  message: "I like bananas",
};

let userHints = {
  name: "",
  surname: "",
  email: "",
  message: "",
};

function a(data: object) {
  return data;
}

userHints = a(userHints) as typeof userHints;
userParam = a(userParam) as typeof userParam;

const user = ref(userParam);
const hints = ref(userHints);
const phoneNumber = "3515472756";
const socials = ["https://www.facebook.com", "https://www.google.com"];

function formatPhone(unformattedNumber: string): string {
  return `${unformattedNumber.slice(0, 3)} ${unformattedNumber.slice(
    3,
    6,
  )} ${unformattedNumber.slice(6, 10)}`;
}
</script>

<style lang="scss">
.contacts {
  &-container {
    align-items: center;
    display: flex;
    gap: 24px;
    justify-content: center;
    margin: 0 320px;
    padding: 164px 0;
  }

  &-card {
    align-items: center;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    gap: 48px;
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

  &-subtext {
    font-size: 16px;
    line-height: 28px;
    text-align: center;
  }

  &-socials {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.socials-button {
  border-radius: 8px;
  height: 48px;
  width: 100%;
}

.button-container {
  align-items: center;
  display: flex;
  gap: 32px;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.button-text {
  color: $primary;
  display: inline-block;
  font-size: 16px;
  font-weight: normal;
  line-height: 28px;
  text-align: left;
  width: 100%;

  &-container {
    align-items: center;
    display: flex;
    gap: 16px;
    width: 100%;
  }
}

.button-icon {
  height: 24px;
  width: 24px;
}

.form {
  &-card {
    gap: 24px;
  }

  &-title {
    font-size: 24px;
    line-height: 28px;
    text-align: center;
  }

  &-content {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &-text {
    width: 100%;
  }

  &-textarea {
    height: 222px;
    resize: none !important;
  }

  &-button {
    width: 100%;
  }
}

.text-hint {
  height: 16px;
}

.q-field__bottom {
  height: 16px;
  min-height: 0;
}

.q-field--with-bottom {
  padding-bottom: 16px;
}

.q-field__control {
  border-radius: 8px !important;
}
</style>
