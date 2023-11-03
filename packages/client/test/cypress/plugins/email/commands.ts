declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Get the last email for the given email address
       */
      getLastEmailFor(address: string): Chainable<string | null>;

      /**
       * Reset all emails for the given email address
       */
      resetEmailsFor(address: string): Chainable<null>;

      /**
       * Reset all emails
       */
      resetAllEmails(): Chainable<null>;
    }
  }
}

/**
 * Call this in the support file
 */
export function registerEmailCommands() {
  Cypress.Commands.add("getLastEmailFor", (address) => {
    return cy.task<string | null>("getLastEmailFor", address);
  });

  Cypress.Commands.add("resetEmailsFor", (address) => {
    return cy.task("resetEmailsFor", address);
  });

  Cypress.Commands.add("resetAllEmails", () => {
    return cy.task("resetAllEmails");
  });
}
