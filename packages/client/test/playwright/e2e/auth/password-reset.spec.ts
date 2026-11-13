import { randomUUID } from "node:crypto";
import { TEST_USER_FORGOT_PASSWORD } from "@/../../server/test/fixtures/users";
import {
  ResetForgottenPasswordDocument,
  SendPasswordResetLinkDocument,
} from "@/services/auth.graphql";
import { expect, test } from "../../fixtures";
import {
  openForgotPasswordForm,
  RESET_PASSWORD_LINK_SENT_MESSAGE,
  submitLogin,
  USER,
} from "../../utils/auth";
import {
  fieldShouldHaveError,
  fillField,
  leaveFieldEmpty,
} from "../../utils/fields";
import { PATHS, ROUTES } from "../../utils/routes";

/**
 * The password of a seeded user cannot be chosen again, so each run picks a new
 * one. The prefix meets the character rules of the form, and the slice keeps
 * the whole password within the maximum of 25 characters.
 */
function uniquePassword() {
  return `Aa1!${randomUUID().slice(0, 21)}`;
}

test.describe("The forgot password form", () => {
  test("should validate the email", async ({ page }) => {
    await page.goto(PATHS.login);
    await page.getByTestId("forgot-password-link").click();
    await expect(page).toHaveRoute(ROUTES.forgotPassword);

    await leaveFieldEmpty(page, "email-field");
    await fieldShouldHaveError(page, "email-field", "This field is required");
    await fillField(page, "email-field", "not_a_valid_email");
    await fieldShouldHaveError(page, "email-field", "The email is not valid");
  });

  test("should answer an email nobody registered like a known one", async ({
    page,
    graphql,
  }) => {
    // An unknown email must look exactly like a known one, to prevent user
    // enumeration attacks. The response is read because the UI is identical by
    // design.
    await page.goto(PATHS.forgotPassword);
    const resetLink = graphql.waitForOperation(SendPasswordResetLinkDocument);

    await fillField(page, "email-field", "non_existent@example.com");
    await page.getByTestId("submit-button").click();

    const { errors } = await resetLink;
    expect(errors).toBeUndefined();
    await expect(page).toHaveRoute(ROUTES.resetPasswordLinkSent);
    await expect(page.getByRole("main")).toContainText(
      RESET_PASSWORD_LINK_SENT_MESSAGE,
    );
  });
});

test.describe("A password reset link", { tag: "@mail" }, () => {
  test("should refuse the password the user already has", async ({
    page,
    mail,
    graphql,
  }) => {
    mail.resetAllEmails();
    // The seeded user is the one whose current password the test knows
    await openForgotPasswordForm(page, mail, USER.email);
    const refused = graphql.waitForOperation(ResetForgottenPasswordDocument);

    await fillField(page, "password-field", USER.password);
    await fillField(page, "password-confirmation-field", USER.password);
    await page.getByTestId("submit-button").click();

    // The message tells this refusal apart from other failures, such as an expired token
    const { errors } = await refused;
    expect(errors).toEqual([
      expect.objectContaining({
        message: "Invalid password, Try something else!",
      }),
    ]);
    await expect(page.getByTestId("error-notification")).toBeVisible();
  });

  test("should let the user choose a new password and log in with it", async ({
    page,
    mail,
    graphql,
  }) => {
    mail.resetAllEmails();
    // A user of its own keeps the test re-runnable without a database reset,
    // since the password it leaves behind is not the seeded one.
    const newPassword = uniquePassword();
    await openForgotPasswordForm(page, mail, TEST_USER_FORGOT_PASSWORD.email);

    await fillField(page, "password-field", newPassword);
    await fillField(page, "password-confirmation-field", newPassword);
    await page.getByTestId("submit-button").click();

    await expect(page).toHaveRoute(ROUTES.login);
    await submitLogin(page, graphql, {
      email: TEST_USER_FORGOT_PASSWORD.email,
      password: newPassword,
    });
    await expect(page).toHaveRoute(ROUTES.home);
  });
});
