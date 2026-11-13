import { init } from "smtp-tester";

// Sending an email means hashing a token, queueing a job and rendering a
// template, which takes much longer than 10 seconds on a busy machine.
const DEFAULT_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 200;

export interface MailFixture {
  /**
   * The body (HTML when present) of the last email sent to the address.
   * Waits for one to arrive when none was received yet.
   */
  getLastEmailFor(
    address: string,
    options?: { timeout?: number },
  ): Promise<string>;
  /** Forgets every received email */
  resetAllEmails(): void;
}

/**
 * Starts an SMTP server which keeps the last email received per recipient in memory.
 * The server app sends its emails here during the e2e tests. Playwright points
 * it at this port through the "server" entry of webServer.
 */
export async function startMailServer(port: number) {
  const server = init(port);
  await new Promise<void>((resolve, reject) => {
    server.smtpServer.server.once("listening", () => {
      resolve();
    });
    server.smtpServer.once("error", (error: Error) => {
      reject(
        new Error(
          `The SMTP capture server cannot listen on port ${port}: ${error.message}`,
        ),
      );
    });
  });

  const emails = new Map<string, string>();

  server.bind((_recipient, _id, email) => {
    const body = typeof email.html === "string" ? email.html : email.body;

    for (const address of Object.keys(email.receivers)) {
      emails.set(address, body ?? "");
    }
  });

  const mail: MailFixture = {
    async getLastEmailFor(address, { timeout = DEFAULT_TIMEOUT_MS } = {}) {
      const deadline = Date.now() + timeout;

      while (Date.now() < deadline) {
        const email = emails.get(address);
        if (email !== undefined) {
          return email;
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      throw new Error(
        `No email was received for "${address}" within ${timeout} ms`,
      );
    },
    resetAllEmails() {
      emails.clear();
    },
  };

  return {
    mail,
    stop: () =>
      new Promise<void>((resolve) => {
        server.stop(() => {
          resolve();
        });
      }),
  };
}
