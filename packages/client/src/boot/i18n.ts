import { until } from "@vueuse/core";
import { LocalStorage, Quasar, QuasarLanguage } from "quasar";
import { boot } from "quasar/wrappers";
import { IntlDateTimeFormat, createI18n } from "vue-i18n";
import { UpdateUserPayload } from "src/@generated/graphql";
import messages from "src/i18n";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";
import { useUpdateUserMutation } from "src/services/user.graphql";

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)["en-US"];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module "vue-i18n" {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {
    full: IntlDateTimeFormat[keyof IntlDateTimeFormat];
  }

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

// This breaks SSR
const i18n = createI18n<[MessageSchema], MessageLanguages, false>({
  locale: "it",
  fallbackLocale: "en-US",
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

export default boot(async ({ app }) => {
  const { onLogin } = useAuthService();
  const locale = LocalStorage.getItem<MessageLanguages>(STORAGE_LOCALE_KEY);
  if (locale) {
    await setLanguage(locale);
  }
  // calls directly if already logged in
  onLogin(async (user) => {
    if (user.locale) {
      await setLanguage(user.locale as MessageLanguages);
    } else {
      await updateUserLocale(i18n.global.locale.value);
    }
  });
  // Set i18n instance on app
  app.use(i18n);
});

const quasarLanguageList = import.meta.glob(
  // Keep the languages in sync with what's available in src/i18n/*
  "../../node_modules/quasar/lang/(en-US|it).mjs",
);
export async function setLanguage(languageCode: MessageLanguages) {
  i18n.global.locale.value = languageCode;

  const { default: languagePack } = (await quasarLanguageList[
    `../../node_modules/quasar/lang/${languageCode}.mjs`
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
