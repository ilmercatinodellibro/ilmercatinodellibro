// Don't import stuff from src/ here, because this file is also used by the client tests
// If possible, don't use any imports at all, and prefer type-only imports if you have to
// Preprocessing of the test files might break or take longer otherwise
import type { Prisma } from "@prisma/client";

/** @see {@link file://./../../prisma/factories/user.ts#PASSWORD_STUB_HASH} */
export const DEFAULT_PASSWORD = "longSecret123!";

export const TEST_ADMIN = {
  email: "admin@example.com",
  emailVerified: true,
  role: "ADMIN",
} satisfies Partial<Prisma.UserCreateInput>;
export const TEST_OPERATOR = {
  email: "operator@example.com",
  emailVerified: true,
  role: "OPERATOR",
} satisfies Partial<Prisma.UserCreateInput>;
export const TEST_USER = {
  email: "user@example.com",
  emailVerified: true,
  role: "USER",
} satisfies Partial<Prisma.UserCreateInput>;
// Separate user which the password is not predictable since it's meant to be used by the forgot password test
export const TEST_USER_FORGOT_PASSWORD = {
  email: "user-forgot-password@example.com",
  emailVerified: true,
  role: "USER",
} satisfies Partial<Prisma.UserCreateInput>;
export const TEST_USER_NON_VERIFIED = {
  email: "non_verified_user@example.com",
  emailVerified: false,
  role: "USER",
} satisfies Partial<Prisma.UserCreateInput>;

export const TEST_USERS = [
  TEST_ADMIN,
  TEST_OPERATOR,
  TEST_USER,
  TEST_USER_FORGOT_PASSWORD,
  TEST_USER_NON_VERIFIED,
];
