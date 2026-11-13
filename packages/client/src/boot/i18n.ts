import { defineBoot } from "#q-app";
import { until } from "@vueuse/core";
import { LocalStorage, Quasar, type QuasarLanguage } from "quasar";
import { type IntlDateTimeFormat, createI18n } from "vue-i18n";
import type { UpdateUserPayload } from "@/@generated/graphql";
import messages from "@/i18n";
import { useAuthService } from "@/services/auth";
import { useRetailLocationService } from "@/services/retail-location";
import { useUpdateUserMutation } from "@/services/user.graphql";

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)["en-US"];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition

declare module "vue-i18n" {
  // define the locale messages schema
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- false positive
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {
    full: IntlDateTimeFormat[keyof IntlDateTimeFormat];
  }

  // define the number format schema
  // export interface DefineNumberFormat {}
}

// This breaks SSR
const i18n = createI18n<[MessageSchema], MessageLanguages, false>({
  locale: "it",
  fallbackLocale: "en-US",
  // vue-i18n 11 deprecates the option. app-vite already defines __VUE_I18N_LEGACY_API__ as false, which makes vue-i18n ignore it,
  // but the option keeps the composition mode explicit should that flag not apply. Remove it when upgrading to vue-i18n 12, which drops the legacy mode.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  legacy: false,
  messages,
  datetimeFormats: {
    "en-US": {
      full: {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      },
    },
    it: {
      full: {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      },
    },
  },
});

export function useI18nOutsideSetup() {
  return i18n.global;
}

export const STORAGE_LOCALE_KEY = "application-locale";

export default defineBoot(async ({ app }) => {
  const { onLogin } = useAuthService();
  const locale = LocalStorage.getItem<MessageLanguages>(STORAGE_LOCALE_KEY);
  if (locale) {
    await setLanguage(locale);
  }
  // calls directly if already logged in
  onLogin(async (user) => {
    await (user.locale
      ? setLanguage(user.locale as MessageLanguages)
      : updateUserLocale(i18n.global.locale.value));
  });
  // Set i18n instance on app
  app.use(i18n);
});

const quasarLanguageList = import.meta.glob(
  // Keep the languages in sync with what's available in src/i18n/*
  "../../node_modules/quasar/lang/{en-US,it}.js",
);
export async function setLanguage(languageCode: MessageLanguages) {
  i18n.global.locale.value = languageCode;

  const { default: languagePack } = (await quasarLanguageList[
    `../../node_modules/quasar/lang/${languageCode}.js`
  ]?.()) as { default: QuasarLanguage };
  Quasar.lang.set(languagePack);

  LocalStorage.set(STORAGE_LOCALE_KEY, languageCode);

  const { user } = useAuthService();
  if (user.value && user.value.locale !== languageCode) {
    // not awaiting on purpose as it waits for location to be set, but that happens in another boot file
    void updateUserLocale(languageCode);
  }
}

async function updateUserLocale(locale: MessageLanguages) {
  const { user, updateCurrentUser } = useAuthService();
  const { updateUser } = useUpdateUserMutation();
  const { selectedLocationId } = useRetailLocationService();

  await until(selectedLocationId).not.toBeUndefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const retailLocationId = selectedLocationId.value!;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentUser = user.value!;
  const updateData = {
    id: currentUser.id,
    locale,
    retailLocationId,
  } satisfies UpdateUserPayload;
  const { data: updatedUser } = await updateUser({
    input: updateData,
  });
  updateCurrentUser(updatedUser);
}
