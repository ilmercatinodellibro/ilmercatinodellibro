import {
  expect,
  test as base,
} from "@quasar/quasar-app-extension-testing-playwright";
import {
  DEFAULT_PASSWORD,
  TEST_ADMIN,
} from "@/../../server/test/fixtures/users";
import { LoginDocument } from "@/services/auth.graphql";
import {
  GetRetailLocationsDocument,
  type RetailLocationFragment,
  UpdateRetailLocationSettingsDocument,
} from "@/services/retail-location.graphql";
import { startMailServer, type MailFixture } from "./mail";

/** The retail location the specs use, its pages live under /mo */
export const LOCATION_ID = "mo";

// Quasar's LocalStorage plugin prefixes a string with this, see src/boot/i18n.ts
// cspell:ignore strn
const STORED_LOCALE = "__q_strn|en-US";
const STORAGE_LOCALE_KEY = "application-locale";

/** Worker options playwright.config.ts fills in, so every port lives in one file. */
export interface AppWorkerOptions {
  /** The port the mail capture server listens on, and the one the server app sends to. */
  smtpPort: number | undefined;
}

// The graphql fixture comes from the Quasar Playwright extension. The app posts
// to an absolute URL, but the fixture's default matcher compares the pathname
// alone, so /graphql matches it and no option is needed.
export const test = base.extend<
  {
    appErrors: Error[];
    adminAuthorization: string;
    registrationLocation: RetailLocationFragment;
  },
  AppWorkerOptions & { mail: MailFixture }
>({
  // playwright.config.ts sets this. There is no default here on purpose: the
  // server app has to be told the very same port, so one of them guessing
  // would leave the mail flow silently broken.
  smtpPort: [undefined, { option: true, scope: "worker" }],

  // The app starts in Italian. The specs assert the English copy, so every page
  // starts with the locale the language switcher would store. Logging in still
  // switches to the locale saved for the user.
  page: async ({ page }, use) => {
    await page.addInitScript(
      ([key, value]) => {
        if (localStorage.getItem(key) === null) {
          localStorage.setItem(key, value);
        }
      },
      [STORAGE_LOCALE_KEY, STORED_LOCALE] as const,
    );
    await use(page);
  },

  // The header of an admin session, for the calls a test makes on the admin's behalf
  adminAuthorization: async ({ graphql }, use) => {
    const { login } = await graphql.execute(LoginDocument, {
      input: { email: TEST_ADMIN.email, password: DEFAULT_PASSWORD },
      retailLocationId: LOCATION_ID,
    });
    await use(`Bearer ${login.jwt}`);
  },

  // The retail location of the specs, with the registration enabled. The seed
  // leaves it disabled, which hides the registration link and makes the server
  // refuse a registration. The settings are restored when the test ends.
  registrationLocation: async ({ graphql, adminAuthorization }, use) => {
    const options = { headers: { authorization: adminAuthorization } };
    const { retailLocations } = await graphql.execute(
      GetRetailLocationsDocument,
      {},
      options,
    );
    const location = retailLocations.find(({ id }) => id === LOCATION_ID);
    if (!location) {
      throw new Error(`The seed has no "${LOCATION_ID}" retail location`);
    }

    const settings = {
      retailLocationId: location.id,
      buyRate: location.buyRate,
      sellRate: location.sellRate,
      maxBookingDays: location.maxBookingDays,
      payOffEnabled: location.payOffEnabled,
      warehouseMaxBlockSize: location.warehouseMaxBlockSize,
    };
    const { updateRetailLocationSettings } = await graphql.execute(
      UpdateRetailLocationSettingsDocument,
      { input: { ...settings, registrationEnabled: true } },
      options,
    );

    await use({ ...location, ...updateRetailLocationSettings });

    await graphql.execute(
      UpdateRetailLocationSettingsDocument,
      {
        input: {
          ...settings,
          registrationEnabled: location.registrationEnabled,
        },
      },
      options,
    );
  },

  // Playwright ignores the errors the app throws, so they are collected, handed
  // over to the test and checked on the way out. A test which expects one clears it.
  appErrors: [
    async ({ page }, use, testInfo) => {
      const errors: Error[] = [];
      const collect = (error: Error) => errors.push(error);
      page.on("pageerror", collect);

      await use(errors);

      page.off("pageerror", collect);
      // A test which already failed has its own report, a second one adds noise
      if (testInfo.status === "passed") {
        expect(errors.map(({ message }) => message)).toEqual([]);
      }
    },
    { auto: true },
  ],

  // The SMTP server listens on a fixed port, so there is one per worker and
  // the e2e project runs on a single worker. See playwright.config.ts.
  mail: [
    async ({ smtpPort }, use) => {
      if (smtpPort === undefined) {
        throw new Error(
          "The mail fixture needs the smtpPort option, set it in playwright.config file.",
        );
      }

      const { mail, stop } = await startMailServer(smtpPort);
      await use(mail);
      await stop();
    },
    { scope: "worker" },
  ],
});

export { expect } from "@quasar/quasar-app-extension-testing-playwright";
