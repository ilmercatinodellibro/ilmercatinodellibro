import registerCodeCoverageTasks from "@cypress/code-coverage/task";
import { injectQuasarDevServerConfig } from "@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server";
import { defineConfig } from "cypress";
import { registerEmailTasks } from "./test/cypress/plugins/email/tasks";
import { vitePreprocessor } from "./test/cypress/plugins/vite-preprocessor";

export default defineConfig({
  fixturesFolder: "test/cypress/fixtures",
  screenshotsFolder: "test/cypress/screenshots",
  videosFolder: "test/cypress/videos",
  downloadsFolder: "test/cypress/downloads",
  video: true,
  env: {
    graphqlEndpoint: "http://localhost:3000/graphql",
  },
  e2e: {
    setupNodeEvents(on, config) {
      on("file:preprocessor", vitePreprocessor());

      registerEmailTasks(on, config);

      registerCodeCoverageTasks(on, config);
      return config;
    },
    baseUrl: "http://localhost:8080/",
    supportFile: "test/cypress/support/e2e.ts",
    specPattern: "test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
  component: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },
    supportFile: "test/cypress/support/component.ts",
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    indexHtmlFile: "test/cypress/support/component-index.html",
    devServer: injectQuasarDevServerConfig(),
  },
});
