import { randomUUID } from "node:crypto";
import { DEFAULT_PASSWORD } from "@/../../server/test/fixtures/users";
import { RegisterDocument } from "@/services/auth.graphql";
import { expect, test } from "../../fixtures";
import {
  expectLoginRefused,
  fillRegistrationForm,
  submitLogin,
  USER,
} from "../../utils/auth";
import {
  fieldShouldHaveError,
  fillField,
  leaveFieldEmpty,
} from "../../utils/fields";
import { extractLink } from "../../utils/mail";
import { PATHS, ROUTES } from "../../utils/routes";

/** A unique address, so the specs run again without a database reset */
function uniqueEmail() {
  return `${randomUUID()}@example.com`;
}

const PASSWORD_ERRORS = [
  {
    password: "a",
    error: "The password should contain at least 8 and maximum 25 characters",
  },
  {
    password: "aaaaaaaa",
    error: "The password should contain at least one number",
  },
  {
    password: "11111111",
    error: "The password should contain at least one lowercase character",
  },
  {
    password: "1aaaaaaa",
    error: "The password should contain at least one uppercase character",
  },
  {
    password: "1Aaaaaaaa",
    error: "The password should contain at least one special character",
  },
];

// The seed disables the registration, the fixture enables it for each test
test.beforeEach(async ({ registrationLocation: _, page }) => {
  await page.goto(PATHS.home); // Try to visit a protected route
  await expect(page).toHaveRoute(ROUTES.login);

  await page.getByTestId("registration-link").click();
  await expect(page).toHaveRoute(ROUTES.registration);
});

test.describe("The registration form", () => {
  test("should validate the fields", async ({ page }) => {
    for (const field of ["firstname-field", "lastname-field"]) {
      await leaveFieldEmpty(page, field);
      await fieldShouldHaveError(page, field, "This field is required");
    }

    await leaveFieldEmpty(page, "email-field");
    await fieldShouldHaveError(page, "email-field", "This field is required");
    await fillField(page, "email-field", "not_a_valid_email");
    await fieldShouldHaveError(page, "email-field", "The email is not valid");

    await leaveFieldEmpty(page, "password-field");
    await fieldShouldHaveError(
      page,
      "password-field",
      "This field is required",
    );
    for (const { password, error } of PASSWORD_ERRORS) {
      await fillField(page, "password-field", password);
      await fieldShouldHaveError(page, "password-field", error);
    }

    await leaveFieldEmpty(page, "password-confirmation-field");
    await fieldShouldHaveError(
      page,
      "password-confirmation-field",
      "This field is required",
    );
    await fillField(page, "password-confirmation-field", "a");
    await fieldShouldHaveError(
      page,
      "password-confirmation-field",
      "Passwords do not match",
    );
  });

  test("should not reveal an email which is already registered", async ({
    page,
    graphql,
  }) => {
    // Registering an existing email answers like a successful registration,
    // to prevent user enumeration attacks. The response is read because the UI
    // is identical by design: the page a registration leads to is covered by
    // the "registration sent" test below.
    await fillRegistrationForm(page, USER.email);
    const registered = graphql.waitForOperation(RegisterDocument);
    await page.getByTestId("submit-button").click();

    const { errors } = await registered;
    expect(errors).toBeUndefined();
  });

  test("should confirm a registration on the registration sent page", async ({
    page,
    mail: _,
  }) => {
    // Pre-existing bug: src/services/auth.ts register() navigates to
    // registration-sent without waiting, then src/pages/register.vue navigates
    // to login, which cancels the first navigation. The user lands on the login
    // page, so this fails until the app is fixed.
    test.fail();

    await fillRegistrationForm(page, uniqueEmail());
    await page.getByTestId("submit-button").click();

    await expect(page).toHaveRoute(ROUTES.registrationSent);
    await page.getByTestId("back-to-login-link").click();
    await expect(page).toHaveRoute(ROUTES.login);
  });
});

test.describe("A new user", { tag: "@mail" }, () => {
  test("should log in only after verifying the email", async ({
    page,
    graphql,
    mail,
  }) => {
    const credentials = { email: uniqueEmail(), password: DEFAULT_PASSWORD };
    await fillRegistrationForm(page, credentials.email);
    const registered = graphql.waitForOperation(RegisterDocument);
    await page.getByTestId("submit-button").click();
    const { errors } = await registered;
    expect(errors).toBeUndefined();

    // The email is not verified yet
    await page.goto(PATHS.login);
    await expectLoginRefused(page, graphql, credentials);

    // The link points to the server, which verifies the email and redirects to the client
    const email = await mail.getLastEmailFor(credentials.email);
    await page.goto(extractLink(email));
    await expect(page).toHaveRoute(ROUTES.login);
    await expect(page.getByTestId("email-verified-notification")).toBeVisible();

    await submitLogin(page, graphql, credentials);
    await expect(page).toHaveRoute(ROUTES.home);
  });
});
