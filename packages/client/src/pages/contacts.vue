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
            :href="'tel:+39' + locationData.phoneNumber"
            class="contacts-details text-secondary"
          >
            {{ formatPhone(locationData.phoneNumber) }}
          </a>
        </span>
        <span class="contacts-subtext text-black-54">
          {{ $t("contacts.text[2]") }}
        </span>
        <q-separator class="black-12" />
        <span class="contacts-text"> {{ $t("contacts.findUs") }} </span>
        <div class="contacts-socials">
          <socials-button
            :link="locationData.socials.facebook"
            name="facebook"
          />
          <socials-button
            :link="locationData.socials.instagram"
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
import { reactive, ref, watch } from "vue";
import socialsButton from "src/components/socials-button.vue";
import { useRetailLocations } from "src/composables/use-retail-location";
import { useAuthService } from "src/services/auth";

const userParam = ref({
  firstname: "",
  lastname: "",
  email: "",
  message: "",
});

const userData = useAuthService();
if (userData.isAuthenticated.value && userData.user.value) {
  userParam.value.firstname = userData.user.value.firstname;
  userParam.value.lastname = userData.user.value.lastname;
  userParam.value.email = userData.user.value.email;
}

const userHints = ref({
  firstname: "",
  lastname: "",
  email: "",
  message: "",
});

const locationDataQuery = useRetailLocations();

const locationData = reactive({
  phoneNumber: "",
  socials: reactive({
    facebook: "",
    instagram: "",
  }),
});

watch(locationDataQuery.loading, () => {
  if (!locationDataQuery.loading.value) {
    // Since the selectedRetailLocation object is empty, the information relative to the Reggio Emilia site is loaded for now
    useRetailLocations().retailLocations.value.forEach((location) => {
      if (location.id === "re") {
        locationData.phoneNumber = location.phoneNumber;
        locationData.socials.facebook = location.facebookLink;
        locationData.socials.instagram = location.instagramLink;
      }
    });
  }
});

function formatPhone(unformattedNumber: string | undefined): string {
  return !unformattedNumber
    ? ""
    : `${unformattedNumber.slice(0, 3)} ${unformattedNumber.slice(
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
