import {
  DEFAULT_PASSWORD,
  TEST_USER,
  TEST_USER_FORGOT_PASSWORD,
  TEST_USER_NON_VERIFIED,
} from "app/../server/test/fixtures/users";
import { uid } from "quasar";
import {
  LoginDocument,
  RegisterDocument,
  ResetForgottenPasswordDocument,
  SendPasswordResetLinkDocument,
} from "src/services/auth.graphql";
import { withinDrawer } from "../utils";

const DASHBOARD_PAGE_WITH_POSSIBLE_DASHBOARD_ID = "/dashboard*";

const fieldShouldHaveError = (dataCy: string, error: string) => {
  cy.dataCy(dataCy)
    .parents(".q-field")
    .get('[role="alert"]')
    .should("contain.text", error);
};

// The error message should be the same for all invalid submit scenarios to prevent user enumeration attacks
// https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account
const safeLoginErrorMessage =
  "User either does not exist, password is incorrect or the email has not been verified yet.";

const resetPasswordMessage =
  "If that email address is in our database, you will receive an email to reset your password. You can close this tab now!";

describe("Authentication", () => {
  beforeEach(() => {
    cy.resetAllEmails();
  });

  it("should allow registering and verifying a new user", () => {
    cy.visit("/dashboard"); // Try to visit a protected route
    cy.testRoute("/login");

    cy.dataCy("registration-link").click();
    cy.testRoute("/registration");

    cy.dataCy("name-field").focus();
    cy.dataCy("name-field").blur(); // Leave the field empty
    fieldShouldHaveError("name-field", "This field is required");

    cy.dataCy("surname-field").focus();
    cy.dataCy("surname-field").blur(); // Leave the field empty
    fieldShouldHaveError("surname-field", "This field is required");

    cy.dataCy("email-field").focus();
    cy.dataCy("email-field").blur(); // Leave the field empty
    fieldShouldHaveError("email-field", "This field is required");
    cy.dataCy("email-field").type("not_a_valid_email");
    fieldShouldHaveError("email-field", "The email is not valid");

    cy.dataCy("password-field").focus();
    cy.dataCy("password-field").blur(); // Leave the field empty
    fieldShouldHaveError("password-field", "This field is required");
    cy.dataCy("password-field").type("a");
    fieldShouldHaveError(
      "password-field",
      "The password should contain at least 8 and maximum 25 characters",
    );
    cy.dataCy("password-field").clear();
    cy.dataCy("password-field").type("aaaaaaaa");
    fieldShouldHaveError(
      "password-field",
      "The password should contain at least one number",
    );
    cy.dataCy("password-field").clear();
    cy.dataCy("password-field").type("11111111");
    fieldShouldHaveError(
      "password-field",
      "The password should contain at least one lowercase character",
    );
    cy.dataCy("password-field").clear();
    cy.dataCy("password-field").type("1aaaaaaa");
    fieldShouldHaveError(
      "password-field",
      "The password should contain at least one uppercase character",
    );
    cy.dataCy("password-field").clear();
    cy.dataCy("password-field").type("1Aaaaaaaa");
    fieldShouldHaveError(
      "password-field",
      "The password should contain at least one of the following special characters",
    );

    cy.dataCy("password-confirmation-field").focus();
    cy.dataCy("password-confirmation-field").blur(); // Leave the field empty
    fieldShouldHaveError(
      "password-confirmation-field",
      "This field is required",
    );
    cy.dataCy("password-confirmation-field").type("a");
    fieldShouldHaveError(
      "password-confirmation-field",
      "Passwords don't match",
    );

    // Registering using an existing email should not reveal anything to prevent user enumeration attacks
    // So, it should not throw an error, it should redirect to registration sent page as if the registration was successful
    cy.withinGraphqlOperation(RegisterDocument, () => {
      cy.dataCy("name-field").type("Test");
      cy.dataCy("surname-field").type("User");
      cy.dataCy("email-field").clear();
      cy.dataCy("email-field").type(TEST_USER.email);
      cy.dataCy("password-field").clear();
      cy.dataCy("password-field").type(DEFAULT_PASSWORD);
      cy.dataCy("password-confirmation-field").clear();
      cy.dataCy("password-confirmation-field").type(DEFAULT_PASSWORD);
      cy.dataCy("submit-button").click();
    });
    cy.dataCy("registration-error").should("not.exist");
    cy.testRoute("/registration-sent");
    cy.dataCy("back-to-login-link").click();
    cy.testRoute("/login");
    cy.dataCy("registration-link").click();
    cy.testRoute("/registration");

    // Use a unique email to avoid having to reset the DB
    const mailToRegister = uid() + "@example.com";

    cy.withinGraphqlOperation(RegisterDocument, () => {
      cy.dataCy("name-field").type("Test");
      cy.dataCy("surname-field").type("User");
      cy.dataCy("email-field").type(mailToRegister);
      cy.dataCy("password-field").type(DEFAULT_PASSWORD);
      cy.dataCy("password-confirmation-field").type(DEFAULT_PASSWORD);
      cy.dataCy("submit-button").click();
    });
    cy.testRoute("/registration-sent");
    cy.dataCy("back-to-login-link").click();
    cy.testRoute("/login");

    // Email is not verified yet, should not be able to log in
    cy.withinGraphqlOperation(
      LoginDocument,
      () => {
        cy.dataCy("email-field").type(mailToRegister);
        cy.dataCy("password-field").type(DEFAULT_PASSWORD);
        cy.dataCy("submit-button").click();
      },
      { allowGraphqlErrors: true },
    );
    cy.dataCy("login-error").should("contain.text", safeLoginErrorMessage);

    cy.getLastEmailFor(mailToRegister).then((email) => {
      expect(email, "Email should have some content").to.exist;

      // The link points to the server, which then verifies the email and redirects to the client
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const link = email!.match(/href="(.*)"/)?.[1];
      expect(link, "Email should contain a link").to.exist;

      cy.request({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        url: link!,
        // Cypress makes two requests instead of one, and ignores the first one
        // This makes the second request fail with "email already verified" error
        // So, we use cy.request() instead of cy.visit(), then visit the login page separately
        // We also ignore the status code to prevent the test from failing
        // See: https://github.com/cypress-io/cypress/issues/2777
        failOnStatusCode: false,
      });
      cy.visit("/login?emailVerified=true");

      // TODO: use this code instead of request()+visit() above when the issue is fixed
      // cy.visit(link!, {
      //   failOnStatusCode: false,
      // });
      // cy.testRoute("/login");

      cy.dataCy("email-verified-notification").should("exist");

      cy.withinGraphqlOperation(LoginDocument, () => {
        cy.dataCy("email-field").clear();
        cy.dataCy("email-field").type(mailToRegister);
        cy.dataCy("password-field").clear();
        cy.dataCy("password-field").type(DEFAULT_PASSWORD);
        cy.dataCy("submit-button").click();
      });
      cy.testRoute(DASHBOARD_PAGE_WITH_POSSIBLE_DASHBOARD_ID);
    });
  });

  it("should allow logging in and out", () => {
    cy.visit("/dashboard"); // Try to visit a protected route
    cy.testRoute("/login");

    cy.dataCy("email-field").focus();
    cy.dataCy("email-field").blur(); // Leave the field empty
    fieldShouldHaveError("email-field", "This field is required");
    cy.dataCy("email-field").type("not_a_valid_email");
    fieldShouldHaveError("email-field", "The email is not valid");
    cy.dataCy("password-field").focus();
    cy.dataCy("password-field").blur(); // Leave the field empty
    fieldShouldHaveError("password-field", "This field is required");

    cy.withinGraphqlOperation(
      LoginDocument,
      () => {
        cy.dataCy("email-field").clear();
        cy.dataCy("email-field").type("non_existent@example.com");
        cy.dataCy("password-field").clear();
        cy.dataCy("password-field").type("non_existent");
        cy.dataCy("submit-button").click();
      },
      { allowGraphqlErrors: true },
    );
    cy.dataCy("login-error").should("contain.text", safeLoginErrorMessage);

    cy.withinGraphqlOperation(
      LoginDocument,
      () => {
        cy.dataCy("email-field").clear();
        cy.dataCy("email-field").type(TEST_USER_NON_VERIFIED.email);
        cy.dataCy("password-field").clear();
        cy.dataCy("password-field").type(DEFAULT_PASSWORD);
        cy.dataCy("submit-button").click();
      },
      { allowGraphqlErrors: true },
    );
    cy.dataCy("login-error").should("contain.text", safeLoginErrorMessage);

    cy.withinGraphqlOperation(
      LoginDocument,
      () => {
        cy.dataCy("email-field").clear();
        cy.dataCy("email-field").type(TEST_USER.email);
        cy.dataCy("password-field").clear();
        cy.dataCy("password-field").type("wrong_password");
        cy.dataCy("submit-button").click();
      },
      { allowGraphqlErrors: true },
    );
    cy.dataCy("login-error").should("contain.text", safeLoginErrorMessage);

    cy.withinGraphqlOperation(LoginDocument, () => {
      cy.dataCy("email-field").clear();
      cy.dataCy("email-field").type(TEST_USER.email);
      cy.dataCy("password-field").clear();
      cy.dataCy("password-field").type(DEFAULT_PASSWORD);
      cy.dataCy("submit-button").click();
    });
    cy.testRoute(DASHBOARD_PAGE_WITH_POSSIBLE_DASHBOARD_ID);
    cy.dataCy("user-item", { timeout: 15000 }).contains(TEST_USER.email);

    // Try to visit the login page while logged in
    cy.visit("/login");
    cy.testRoute(DASHBOARD_PAGE_WITH_POSSIBLE_DASHBOARD_ID);

    withinDrawer(() => {
      cy.dataCy("logout-button").click();
    });
    cy.testRoute("/login");

    // Try to visit a protected route while logged out
    cy.visit("/dashboard");
    cy.testRoute("/login");
  });

  it("should allow resetting the password", () => {
    cy.visit("/login");

    cy.dataCy("forgot-password-link").click();
    cy.testRoute("/forgot-password");

    cy.dataCy("email-field").focus();
    cy.dataCy("email-field").blur(); // Leave the field empty
    fieldShouldHaveError("email-field", "This field is required");
    cy.dataCy("email-field").type("not_a_valid_email");
    fieldShouldHaveError("email-field", "The email is not valid");

    // Non-existent user should not reveal anything to prevent user enumeration attacks
    // So, the request should not fail, and the message should be the same as for the existing user
    cy.withinGraphqlOperation(
      SendPasswordResetLinkDocument,
      () => {
        cy.dataCy("email-field").clear();
        cy.dataCy("email-field").type("non_existent@example.com");
        cy.dataCy("submit-button").click();
      },
      {
        allowGraphqlErrors: false,
      },
    );
    cy.testRoute("/reset-password-link-sent");
    cy.get("body").should("contain.text", resetPasswordMessage);

    // Can't choose the same password as the current one
    // We use the TEST_USER for this as it's password is predictable
    openChangePasswordForm(TEST_USER.email).then(() => {
      cy.withinGraphqlOperation(
        ResetForgottenPasswordDocument,
        () => {
          cy.dataCy("password-field").type(DEFAULT_PASSWORD);
          cy.dataCy("password-confirmation-field").type(DEFAULT_PASSWORD);
          cy.dataCy("submit-button").click();
        },
        { allowGraphqlErrors: true },
      );
      cy.dataCy("error-notification").should("exist");
    });

    // To not have to reset the DB every time, we use a separate user for this test
    // We set a unique password each time so that we can reset the password without conflicts
    openChangePasswordForm(TEST_USER_FORGOT_PASSWORD.email).then(() => {
      // Omitting the password validation tests as the registration tests already cover them, even though in a different form

      // The maximum length of the password is 25 characters
      // So, to create a unique password, we try to meet the lowercase, uppercase, etc. requirements first
      // then slice the UUID to not exceed the maximum length while still having uniqueness to a good extent
      const newPassword = "Aa1!" + uid().slice(0, 21);

      cy.withinGraphqlOperation(ResetForgottenPasswordDocument, () => {
        cy.dataCy("password-field").clear();
        cy.dataCy("password-field").type(newPassword);
        cy.dataCy("password-confirmation-field").clear();
        cy.dataCy("password-confirmation-field").type(newPassword);
        cy.dataCy("submit-button").click();
      });
      cy.testRoute("/login");

      cy.withinGraphqlOperation(LoginDocument, () => {
        cy.dataCy("email-field").type(TEST_USER_FORGOT_PASSWORD.email);
        cy.dataCy("password-field").type(newPassword);
        cy.dataCy("submit-button").click();
      });
      cy.testRoute(DASHBOARD_PAGE_WITH_POSSIBLE_DASHBOARD_ID);
    });
  });
});

/**
 * Triggers the forgot password flow and visits the reset password link from the email
 * Use .then() to continue to do stuff with the password reset form
 */
function openChangePasswordForm(emailAddress: string) {
  cy.visit("/forgot-password");
  cy.withinGraphqlOperation(SendPasswordResetLinkDocument, () => {
    cy.dataCy("email-field").clear();
    cy.dataCy("email-field").type(emailAddress);
    cy.dataCy("submit-button").click();
  });
  cy.testRoute("/reset-password-link-sent");
  cy.get("body").should("contain.text", resetPasswordMessage);

  return cy.getLastEmailFor(emailAddress).then((email) => {
    expect(email, "Email should have some content").to.exist;

    // The link points to the client, which opens the reset password form
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const link = email!.match(/href="(.*)"/)?.[1];
    expect(link, "Email should contain a link").to.exist;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cy.visit(link!);
  });
}
