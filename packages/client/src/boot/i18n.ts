import { LocalStorage, Quasar, QuasarLanguage } from "quasar";
import { boot } from "quasar/wrappers";
import { IntlDateTimeFormat, createI18n } from "vue-i18n";
import messages from "src/i18n";

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
  const locale = LocalStorage.getItem<MessageLanguages>(STORAGE_LOCALE_KEY);
  if (locale) {
    await setLanguage(locale);
  }
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
}
