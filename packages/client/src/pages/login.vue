<!-- eslint-disable vue/no-v-html -->
<template>
  <q-page
    :class="isMobile ? 'column items-stretch' : 'items-start row'"
    class="gap-32 justify-evenly q-pa-lg"
  >
    <template v-if="isMobile">
      <q-btn
        :icon="mdiArrowLeft"
        color="accent"
        :label="t('auth.backToLocations')"
        :to="{ name: AvailableRouteNames.SelectLocation }"
      />

      <q-btn
        :icon="mdiArrowDown"
        :label="t('auth.goToLogin')"
        color="accent"
        no-caps
        @click="scrollToLogin()"
      />
    </template>

    <faq-info />

    <q-card
      ref="loginCard"
      :class="isMobile ? 'self-center' : ''"
      class="column full-width gap-24 max-width-300 q-my-xl q-pa-lg text-center"
    >
      <q-img :src="theme.logo" fit="contain" height="60px" />

      <q-card-section class="no-padding">
        <q-form greedy class="column gap-8" @submit="onSubmit">
          <q-input
            v-model="user.email"
            :rules="[requiredRule, emailRule]"
            :label="t('auth.email')"
            lazy-rules
            outlined
            type="email"
            data-cy="email-field"
          />

          <k-password-input
            v-model="user.password"
            v-model:show="showPassword"
            :rules="[requiredRule]"
            :label="t('auth.password')"
            outlined
            lazy-rules
            autocomplete="password"
            data-cy="password-field"
          />

          <q-btn
            class="full-width"
            color="primary"
            :label="t('auth.login')"
            type="submit"
            data-cy="submit-button"
            :loading="isLoggingIn"
          />
        </q-form>
      </q-card-section>

      <span
        class="privacy-links"
        v-html="t('auth.privacyAndToSLogin', [selectedLocation.id])"
      />

      <template v-if="SOCIAL_LOGIN_ENABLED">
        <q-separator />

        <q-card-section class="column gap-8 no-padding">
          <span> {{ t("common.or") }} </span>

          <social-auth-buttons type="login" />
        </q-card-section>
      </template>

      <q-separator />

      <q-card-section
        v-if="selectedLocation.registrationEnabled"
        class="no-padding"
      >
        <p class="text-black-87">{{ t("auth.noAccount") }}</p>

        <q-btn
          :to="{ name: 'registration' }"
          :label="t('auth.register')"
          class="full-width outline-black-12"
          color="black-87"
          outline
        />
      </q-card-section>

      <q-separator />

      <router-link
        class="text-black-87 text-subtitle1"
        :to="{ name: 'forgot-password' }"
        data-cy="forgot-password-link"
      >
        {{ t("auth.forgotPassword") }}
      </router-link>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ApolloError } from "@apollo/client/core";
import { mdiArrowDown, mdiArrowLeft } from "@quasar/extras/mdi-v7";
import { Notify, QCard } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { LoginPayload } from "src/@generated/graphql";
import FaqInfo from "src/components/faq-info.vue";
import KPasswordInput from "src/components/k-password-input.vue";
import SocialAuthButtons from "src/components/social-auth-buttons.vue";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { useTheme } from "src/composables/use-theme";
import { notifyError } from "src/helpers/error-messages";
import { emailRule, requiredRule } from "src/helpers/rules";
import { AvailableRouteNames } from "src/models/routes";
import { useLoginMutation } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

const props = defineProps<{
  emailVerified?: boolean;
}>();

const { t } = useI18n();

const { selectedLocation } = useRetailLocationService();

const { isMobile } = useLateralDrawer();
const { theme } = useTheme();

const SOCIAL_LOGIN_ENABLED =
  process.env.SOCIAL_LOGIN_ENABLED === "true" &&
  selectedLocation.value.registrationEnabled;

if (props.emailVerified) {
  Notify.create({
    message: t("auth.emailVerified"),
    color: "positive",
    attrs: {
      "data-cy": "email-verified-notification",
    },
  });
}

const user = ref<LoginPayload>({
  email: "",
  password: "",
});

const showPassword = ref(false);

const loginCard = ref<QCard>();

function scrollToLogin() {
  if (!loginCard.value) {
    return;
  }
  const loginCardElement = loginCard.value.$el as Element;
  loginCardElement.scrollIntoView({ behavior: "smooth" });
}

const { login, loading: isLoggingIn } = useLoginMutation();

async function onSubmit() {
  try {
    await login({
      input: user.value,
      retailLocationId: selectedLocation.value.id,
    });
  } catch (error) {
    const { message, graphQLErrors } = error as ApolloError;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we're not sure if this a false positive or not
    const status = graphQLErrors[0]?.extensions?.status as number | undefined;

    // TODO: implement centralized error handling

    notifyError(message, "login-error");

    if (!status || ![401, 422].includes(status)) {
      console.error(error);
    }
  }
}
</script>

<style lang="scss" scoped>
.outline-black-12::before {
  border-color: rgb(0 0 0 / 12%);
}

:deep(.privacy-links > a) {
  text-decoration: none;
}
</style>
