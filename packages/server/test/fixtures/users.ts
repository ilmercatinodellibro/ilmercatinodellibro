// This file is also used by the client tests, so keep it free of server-only code:
// - Import nothing from src/. The alias points at the client's src/ in the client tests.
// - Prefer no imports at all, and type-only ones when needed, or preprocessing the
//   test files may break or take longer.
// - Avoid `process.env` and Node-specific APIs, they are not available in the browser.
// The Prisma types cannot use the alias, hence the relative path.
import type { Prisma } from "../../src/@generated/prisma/client.js";
import type { Role } from "../../src/@generated/prisma/enums.js";

/** @see {@link file://./../../prisma/factories/user.ts#PASSWORD_STUB_HASH} */
export const DEFAULT_PASSWORD = "longSecret123!";

export type SeedUserCreateInput = Partial<Prisma.UserCreateInput> & {
  role?: Role;
};

export const TEST_ADMIN = {
  email: "admin@example.com",
  emailVerified: true,
  role: "ADMIN",
  phoneNumber: "+393324538390",
} satisfies SeedUserCreateInput;
export const TEST_OPERATOR = {
  email: "operator@example.com",
  emailVerified: true,
  role: "OPERATOR",
  phoneNumber: "+394343515887",
} satisfies SeedUserCreateInput;
export const TEST_USER = {
  email: "user@example.com",
  emailVerified: true,
  phoneNumber: "+393182463108",
} satisfies SeedUserCreateInput;
// Separate user which the password is not predictable since it's meant to be used by the forgot password test
export const TEST_USER_FORGOT_PASSWORD = {
  email: "user-forgot-password@example.com",
  emailVerified: true,
  phoneNumber: "+393106083278",
} satisfies SeedUserCreateInput;
export const TEST_USER_NON_VERIFIED = {
  email: "non_verified_user@example.com",
  emailVerified: false,
  phoneNumber: "+393324538393",
} satisfies SeedUserCreateInput;

export const TEST_USERS = [
  TEST_ADMIN,
  TEST_OPERATOR,
  TEST_USER,
  TEST_USER_FORGOT_PASSWORD,
  TEST_USER_NON_VERIFIED,
];
