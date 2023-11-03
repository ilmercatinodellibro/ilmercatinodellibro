# Cypress smtp-tester plugin

This plugin is used to test email sending in Cypress.
It launches a local SMTP server communicates with the Cypress test runner through Cypress tasks.

## Setup

```ts
// cypress.config.ts
import { registerEmailTasks } from "./test/cypress/plugins/email/tasks";
// ...

export default defineConfig({
  // ...
  e2e: {
    setupNodeEvents(on, config) {
      registerEmailTasks(on, config); // <-- register the tasks
      // ...
    },
    // ...
  },
});
```

```ts
// cypress/support/e2e.ts - or any other support file
import { registerEmailCommands } from "./test/cypress/plugins/email/commands";

registerEmailCommands(); // <-- register the commands
```

They are exported from different entry points since they run on different contexts. (Node vs Browser)

## Usage

### getLastEmailFor

You can get the last email sent to a specific address with `cy.getLastEmailFor`.
If there is already an email in the memory, it will return it immediately.
Otherwise, it will wait until the email is received, and has the standard timeout of Cypress tasks. (`config.taskTimeout`)
It will check presence of an email for every 1/10th of the timeout.
So, if you want to ensure a new email is arrived while you already received some before, you can reset the emails beforehand.

```ts
// in a test file
cy.get("button").click(); // trigger an email sending on the server

cy.getLastEmailFor("user@example.com").then((email) => {
  expect(email).to.be("Hello world");
});
```

### resetAllEmails

You can reset all emails with `cy.resetAllEmails`.

```ts
beforeEach(() => {
  cy.resetAllEmails();
});
```

### resetEmailFor

You can reset the email for a specific address with `cy.resetEmailFor`.
You may need this if you will receive multiple mails for the same address consecutively. See [`getLastEmailFor`](#getLastEmailFor) for more details.

```ts
beforeEach(() => {
  cy.resetEmailFor("user@example.com");
});
```
