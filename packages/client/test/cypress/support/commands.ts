import { registerCommands as registerQuasarTestingCommands } from "@quasar/quasar-app-extension-testing-e2e-cypress";
import { DEFAULT_PASSWORD } from "app/../server/test/fixtures/users";
import { LoginDocument } from "src/services/auth.graphql";
import { registerEmailCommands } from "../plugins/email/commands";
import { registerCommands as registerGraphqlCommands } from "./graphql/commands";

registerQuasarTestingCommands();
registerGraphqlCommands();
registerEmailCommands();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(username: string, password?: string): void;
    }
  }
}

Cypress.Commands.add("login", (email, password = DEFAULT_PASSWORD) => {
  cy.session([email, password], () => {
    cy.visit("/login");
    cy.withinGraphqlOperation(LoginDocument, () => {
      cy.dataCy("email-field").type(email);
      cy.dataCy("password-field").type(password);
      cy.dataCy("submit-button").click();
    });
    cy.dataCy("user-item", { timeout: 15000 }).contains(email);
  });
});
