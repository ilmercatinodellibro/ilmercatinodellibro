import type { Page } from "@playwright/test";
import type { GraphqlFixture } from "@quasar/quasar-app-extension-testing-playwright";
import {
  DEFAULT_PASSWORD,
  TEST_USER,
} from "@/../../server/test/fixtures/users";
import { LoginDocument } from "@/services/auth.graphql";
import { expect } from "../fixtures";
import type { MailFixture } from "../fixtures/mail";
import { fillField } from "./fields";
import { extractLink } from "./mail";
import { PATHS, ROUTES } from "./routes";

export interface Credentials {
  email: string;
  password: string;
}

/** The seeded user whose password the specs know */
export const USER: Credentials = {
  email: TEST_USER.email,
  password: DEFAULT_PASSWORD,
};

// The error message is the same for every failed login, to prevent user enumeration attacks
// https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account
export const SAFE_LOGIN_ERROR_MESSAGE =
  "User either does not exist, password is incorrect or the email has not been verified yet.";

export const RESET_PASSWORD_LINK_SENT_MESSAGE =
  "If that email address is in our database, you will receive an email to reset your password.";

/** Fills the login form and waits for the answer of the attempt */
export async function submitLogin(
  page: Page,
  graphql: GraphqlFixture,
  { email, password }: Credentials,
) {
  await fillField(page, "email-field", email);
  await fillField(page, "password-field", password);
  // Every failed login shows the same notification and the button drops
  // clicks while a login is in flight, so the response is the only sign
  // that the attempt is over.
  const answered = graphql.waitForOperation(LoginDocument);
  await page.getByTestId("submit-button").click();

  return await answered;
}

/**
 * Every refused login shows the same message, so the response is what proves
 * the server refused it, and a toast left by an earlier attempt cannot pass for it.
 */
export async function expectLoginRefused(
  page: Page,
  graphql: GraphqlFixture,
  credentials: Credentials,
) {
  const { errors } = await submitLogin(page, graphql, credentials);
  expect(errors).toBeDefined();
  await expect(page.getByTestId("login-error").last()).toContainText(
    SAFE_LOGIN_ERROR_MESSAGE,
  );
}

/** Fills the registration form of an adult, so the delegate can stay empty */
export async function fillRegistrationForm(page: Page, email: string) {
  await fillField(page, "firstname-field", "Test");
  await fillField(page, "lastname-field", "User");
  await fillField(page, "date-of-birth-field", "1990-01-01");
  await fillField(page, "phone-number-field", "3331234567");
  await fillField(page, "email-field", email);
  await fillField(page, "confirm-email-field", email);
  await fillField(page, "password-field", DEFAULT_PASSWORD);
  await fillField(page, "password-confirmation-field", DEFAULT_PASSWORD);
}

/** Requests a reset link, then opens it from the email, which shows the reset password form */
export async function openForgotPasswordForm(
  page: Page,
  mail: MailFixture,
  emailAddress: string,
) {
  await page.goto(PATHS.forgotPassword);

  await fillField(page, "email-field", emailAddress);
  await page.getByTestId("submit-button").click();
  await expect(page).toHaveRoute(ROUTES.resetPasswordLinkSent);
  await expect(page.getByRole("main")).toContainText(
    RESET_PASSWORD_LINK_SENT_MESSAGE,
  );

  const email = await mail.getLastEmailFor(emailAddress);
  // The link points to the client, which opens the reset password form
  await page.goto(extractLink(email));
}
