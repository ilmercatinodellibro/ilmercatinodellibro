import { init } from "smtp-tester";

/**
 * Call this in Cypress config file > setupNodeEvents
 */
export function registerEmailTasks(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
) {
  const port = (config.env.smtpPort as number | undefined) ?? 7777;
  const server = init(port);
  process.on("exit", () => {
    server.stop(() => {
      // no-op
    });
  });

  /**
   * Email address to email body map
   */
  const emailsMap = new Map<string, string>();

  server.bind((_recipient, _id, email) => {
    const to = email.headers.to as string;
    emailsMap.set(to, (email.html || email.body) ?? "");
  });

  // cy.task cannot return undefined, so return null as a fallback when needed
  on("task", {
    getLastEmailFor(address: string) {
      if (emailsMap.has(address)) {
        return emailsMap.get(address) ?? null;
      }

      // Try 10 times, waiting 1/10th of the task timeout between each try,
      // until the email is received
      return new Promise<string | null>((resolve) => {
        const interval = setInterval(() => {
          const email = emailsMap.get(address)?.at(-1);
          if (email) {
            clearInterval(interval);
            resolve(email);
          }
        }, config.taskTimeout / 10);
      });
    },
    resetEmailsFor(address: string) {
      emailsMap.delete(address);
      return null;
    },
    resetAllEmails() {
      emailsMap.clear();
      return null;
    },
  });

  return config;
}
