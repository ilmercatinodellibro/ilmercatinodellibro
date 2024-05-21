<template>
  <q-page class="column justify-center registration-page">
    <div class="items-center justify-center row">
      <q-card class="form-card full-width text-center">
        <q-form greedy @submit="onSubmit">
          <q-card-section class="text-dark text-h4">
            {{ t(`auth.register`) }}
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="user.firstname"
              :rules="[requiredRule]"
              type="text"
              outlined
              lazy-rules
              :label="t(`auth.firstName`)"
            />
            <q-input
              v-model="user.lastname"
              :rules="[requiredRule]"
              lazy-rules
              :label="t(`auth.lastName`)"
              outlined
              type="text"
            />
            <q-input
              :model-value="user.email"
              :rules="[requiredRule, emailRule]"
              lazy-rules
              :label="t(`auth.email`)"
              outlined
              readonly
              type="email"
            />
            <k-password-input
              v-model="user.password"
              v-model:show="showPassword"
              :rules="[requiredRule, validatePasswordRule]"
              :label="t(`auth.password`)"
              outlined
              lazy-rules
              autocomplete="password"
            />
            <password-strength-bar
              :password-to-check="user.password"
              :steps="STRENGTH_BAR_STEPS"
            />
            <k-password-input
              v-model="user.passwordConfirmation"
              v-model:show="showPassword"
              :rules="[requiredRule, passwordMatchRule]"
              :label="t(`auth.confirmPassword`)"
              outlined
              lazy-rules
              autocomplete="password"
            />
          </q-card-section>
          <q-card-section>
            <q-btn
              class="full-width"
              color="accent"
              :label="t(`auth.register`)"
              text-color="black-54"
              type="submit"
              :loading="isRegistering"
            />
          </q-card-section>
          <q-card-section>
            <span class="text-dark text-subtitle1">
              {{ t(`common.or`) }}&nbsp;
              <router-link to="login" class="text-dark">
                {{ t(`auth.login`) }}
              </router-link>
            </span>
          </q-card-section>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from "quasar";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import PasswordStrengthBar from "components/password-strength-bar.vue";
import { RegisterPayload } from "src/@generated/graphql";
import KPasswordInput from "src/components/k-password-input.vue";
import { STRENGTH_BAR_STEPS } from "src/components/models";
import { notifyError } from "src/helpers/error-messages";
import {
  emailRule,
  makeValueMatchRule,
  requiredRule,
  validatePasswordRule,
} from "src/helpers/rules";
import { ServerError } from "src/models/server";
import {
  useAuthService,
  useRegisterWithTokenMutation,
} from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";

const { t } = useI18n();

const showPassword = ref(false);

const props = defineProps<{
  token: string;
  email: string;
}>();

const user = reactive<Omit<RegisterPayload, "retailLocationId">>({
  email: props.email,
  firstname: "",
  lastname: "",
  password: "",
  passwordConfirmation: "",
});

const { registerWithToken, loading: isRegistering } =
  useRegisterWithTokenMutation();

const router = useRouter();

const { getJwtHeader } = useAuthService();

const passwordMatchRule = makeValueMatchRule(
  () => user.password,
  () => t("auth.passwordDoNotMatch"),
);

const { selectedLocation } = useRetailLocationService();

async function onSubmit() {
  try {
    if (props.token) {
      await registerWithToken(
        {
          input: {
            ...user,
            retailLocationId: selectedLocation.value.id,
          },
        },
        // We override the request context to add the one-shot JWT token header
        // See https://www.apollographql.com/docs/react/data/mutations#context
        { context: { headers: getJwtHeader(props.token) } },
      );
      void router.push({ name: "login" });
      Notify.create({
        type: "positive",
        message: t("auth.registeredSuccessfully"),
      });
    }
  } catch (e) {
    const { message, status } = e as ServerError;

    // TODO: implement centralized error handling

    notifyError(message);

    if (![400, 404].includes(status)) {
      throw e;
    }
  }
}
</script>

<style lang="scss" scoped>
$breakpoint-smaller: 400px;
$breakpoint-medium: 700px;
$breakpoint-large: 1200px;
$breakpoint-extra-large: 1640px;
$form-width: 280px;
$registration-page-padding-lg: 25px 100px;
$registration-page-padding-sm: 50px;
$registration-page-padding: 50px 16px;

.registration-page {
  padding: $registration-page-padding;

  @media screen and (min-width: $breakpoint-smaller) {
    padding: $registration-page-padding-sm;
  }

  @media screen and (min-width: $breakpoint-medium) {
    flex-direction: row;
  }

  @media screen and (min-width: $breakpoint-large) {
    padding: $registration-page-padding-lg;
  }
}

.form-card {
  @media screen and (min-width: $breakpoint-medium) {
    max-width: $form-width;
  }
}
</style>
