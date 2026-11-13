import {
  DEFAULT_PASSWORD,
  TEST_USER_NON_VERIFIED,
} from "@/../../server/test/fixtures/users";
import { expect, test } from "../../fixtures";
import { expectLoginRefused, submitLogin, USER } from "../../utils/auth";
import { withinDrawer } from "../../utils/drawer";
import {
  fieldShouldHaveError,
  fillField,
  leaveFieldEmpty,
} from "../../utils/fields";
import { PATHS, ROUTES } from "../../utils/routes";
import { LOGIN_TIMEOUT_MS } from "../../utils/timeouts";

const REFUSED_LOGINS = [
  {
    name: "an email nobody registered",
    credentials: {
      email: "non_existent@example.com",
      password: "non_existent",
    },
  },
  {
    name: "an email which is not verified yet",
    credentials: {
      email: TEST_USER_NON_VERIFIED.email,
      password: DEFAULT_PASSWORD,
    },
  },
  {
    name: "a password which does not match",
    credentials: { email: USER.email, password: "wrong_password" },
  },
];

test.describe("The login form", () => {
  test("should validate the fields", async ({ page }) => {
    await page.goto(PATHS.login);

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
  });

  for (const { name, credentials } of REFUSED_LOGINS) {
    test(`should refuse ${name}`, async ({ page, graphql }) => {
      await page.goto(PATHS.login);

      await expectLoginRefused(page, graphql, credentials);
    });
  }
});

test.describe("Authentication", () => {
  test("should allow logging in and out", async ({ page, graphql }) => {
    await page.goto(PATHS.home); // Try to visit a protected route
    await expect(page).toHaveRoute(ROUTES.login);

    await submitLogin(page, graphql, USER);
    await expect(page).toHaveRoute(ROUTES.home);
    await expect(
      page.getByTestId("user-item").filter({ hasText: USER.email }),
    ).toBeVisible({ timeout: LOGIN_TIMEOUT_MS });

    // Try to visit the login page while logged in
    await page.goto(PATHS.login);
    await expect(page).toHaveRoute(ROUTES.home);

    await withinDrawer(page, async (drawer) => {
      await drawer.getByTestId("logout-button").click();
    });
    await expect(page).toHaveRoute(ROUTES.login);

    // Try to visit a protected route while logged out
    await page.goto(PATHS.home);
    await expect(page).toHaveRoute(ROUTES.login);
  });
});
