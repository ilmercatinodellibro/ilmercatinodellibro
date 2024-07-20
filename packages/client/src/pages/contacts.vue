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
                  :href="`mailto:${selectedLocation.email}`"
                  class="contacts-details text-accent"
                  rel="noopener"
                  target="_blank"
                >
                  {{ selectedLocation.email }}
                </a>
              </span>
            </template>
          </i18n-t>
        </span>
        <span class="contacts-text text-accent">
          <a
            :href="'tel:+39' + selectedLocation.phoneNumber"
            class="contacts-details text-accent"
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
    <q-card class="contacts-card gap-16">
      <p class="text-center text-size-24">
        {{ $t("contacts.form.title") }}
      </p>
      <q-form
        class="column flow-grow full-width gap-16"
        greedy
        @submit="submitFeedback"
      >
        <q-input
          v-model="contactData.firstname"
          :disable="isAuthenticated"
          :label="$t('contacts.form.firstname')"
          bottom-slots
          class="black-54 full-width"
          outlined
          type="text"
        />

        <q-input
          v-model="contactData.lastname"
          :disable="isAuthenticated"
          :label="$t('contacts.form.lastname')"
          bottom-slots
          class="black-54 full-width"
          outlined
          type="text"
        />

        <q-input
          v-model="contactData.email"
          :disable="isAuthenticated"
          :label="$t('contacts.form.email')"
          bottom-slots
          class="black-54 full-width"
          outlined
          type="text"
        />

        <q-input
          v-model="message"
          :label="$t('contacts.form.message')"
          bottom-slots
          class="black-54 full-width height-200"
          outlined
          type="textarea"
        />

        <q-btn
          :label="$t('contacts.form.send')"
          :loading="loading"
          color="accent"
          type="submit"
        />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from "quasar";
import { defineAsyncComponent, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import SocialButton from "src/components/social-button.vue";
import { notifyError } from "src/helpers/error-messages";
import { useAuthService } from "src/services/auth";
import { useFeedbackMutation } from "src/services/feedback.graphql";
import { useRetailLocationService } from "src/services/retail-location";

const HeaderBar = defineAsyncComponent(
  () => import("src/components/header-bar.vue"),
);

const contactData = reactive({
  firstname: "",
  lastname: "",
  email: "",
});

const message = ref("");

const { isAuthenticated, user } = useAuthService();
if (user.value) {
  contactData.firstname = user.value.firstname;
  contactData.lastname = user.value.lastname;
  contactData.email = user.value.email;
}

const { selectedLocation } = useRetailLocationService();

function formatPhone(unformattedNumber: string | undefined) {
  if (!unformattedNumber) {
    return "";
  }

  const firstPart = unformattedNumber.slice(0, 3);
  const secondPart = unformattedNumber.slice(3, 6);
  const thirdPart = unformattedNumber.slice(6, 10);

  return `${firstPart} ${secondPart} ${thirdPart}`;
}

const { t, locale } = useI18n();

const { feedback, loading } = useFeedbackMutation();

async function submitFeedback() {
  try {
    await feedback({
      input: {
        ...contactData,
        message: message.value,
        locale: locale.value,
      },
    });

    Notify.create({
      message: t("general.feedbackRequestSent"),
      color: "positive",
    });

    message.value = "";
  } catch (e) {
    notifyError(t("general.feedbackRequestError"));
  }
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

:deep(.q-field__bottom) {
  height: 16px;
  min-height: 0;
}

:deep(.q-field--with-bottom) {
  padding-bottom: 16px;
}

:deep(.q-field__control) {
  border-radius: 8px !important;
}
</style>
