import { registerHooks } from "node:module";
import { defineConfig, devices } from "@playwright/test";
import type { QuasarWorkerOptions } from "@quasar/quasar-app-extension-testing-playwright";
import type { AppWorkerOptions } from "./test/playwright/fixtures";
import { resolve } from "./test/playwright/graphql-import-hook";

// Playwright evaluates this file in the runner and in every worker, so the hook
// is active wherever the tests and their imports load. See the hook file.
registerHooks({ resolve });

// Every port of a run lives here. The apps get them through the environment,
// which wins over their .env files, so a run never depends on what a developer
// keeps in them. They differ from the defaults of the .env.example files, so a
// run never reuses an app started by hand for development.
const developmentServerPort = 8090;
const serverPort = 3010;
// The mail fixture listens here and the server app is told to send here
const smtpPort = 7787;

const clientOrigin = `http://localhost:${developmentServerPort}`;
const appUrl = `${clientOrigin}/`;
const serverHost = `localhost:${serverPort}`;
const serverOrigin = `http://${serverHost}`;

// Nest closes its database and queue connections on SIGTERM
const gracefulShutdown = { signal: "SIGTERM", timeout: 5000 } as const;

const clientDevelopmentServer = {
  name: "client",
  command: "quasar dev",
  url: appUrl,
  reuseExistingServer: true,
  timeout: 120_000,
  env: {
    // QUASAR_TESTING_PLAYWRIGHT=true keeps the browser closed and instruments the app for coverage.
    // The AE reads the port from here, so change developmentServerPort above and nothing else.
    QUASAR_TESTING_PLAYWRIGHT: "true",
    QUASAR_TESTING_PLAYWRIGHT_PORT: String(developmentServerPort),
    // The .env file builds these from DOMAIN, but it expands them with its own
    // DOMAIN, so each of them is overridden.
    GRAPHQL_DOMAIN: serverOrigin,
    GRAPHQL_URL: `${serverOrigin}/graphql`,
    GRAPHQL_WS_DOMAIN: `ws://${serverHost}`,
    GRAPHQL_WS_URL: `ws://${serverHost}/subscriptions`,
  },
};

// The database and the queue come from packages/server/.env, start and seed them first.
const serverApplication = {
  name: "server",
  command: "pnpm --filter @ilmercatinodellibro/server start",
  port: serverPort,
  env: {
    // The links of the emails point to the client the tests drive
    CLIENT_URL: clientOrigin,
    SERVER_PORT: String(serverPort),
    SERVER_URL: serverOrigin,
    // The capture server the mail fixture runs, instead of a real mail service.
    // It offers no authentication, so the server sends without logging in.
    MAIL_HOST: "localhost",
    MAIL_PORT: String(smtpPort),
    MAIL_SECURE: "false",
  },
  reuseExistingServer: true,
  // "nest start" compiles the server first
  timeout: 180_000,
  gracefulShutdown,
};

// https://playwright.dev/docs/test-configuration
export default defineConfig<unknown, QuasarWorkerOptions & AppWorkerOptions>({
  reporter: "html",
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Handed to the mail fixture, so the ports stay together in this file
    smtpPort,
    // Turns the coverage collector on. It is off by default because it needs a
    // page, and that would create one even for a test that opens none.
    coverage: true,
  },
  projects: [
    {
      name: "e2e",
      testDir: "test/playwright/e2e",
      // These share one database, one server app and one SMTP capture server on
      // a fixed port, and they change the settings of a retail location and the
      // password of a seeded user, so they cannot safely run in parallel.
      workers: 1,
      // The registration spec walks a long form, so 30 seconds is tight.
      timeout: 60_000,
      // Playwright assertions wait 5 seconds by default. On the first visit to a page,
      // the dev server compiles it first, and that can take longer than 5 seconds.
      expect: { timeout: 15_000 },
      use: {
        ...devices["Desktop Chrome"],
        baseURL: appUrl,
        // A service worker would answer requests before the GraphQL fixture sees them
        serviceWorkers: "block",
      },
    },
  ],
  webServer: [serverApplication, clientDevelopmentServer],
});
