import { times } from "lodash-es";
import { createUser } from "prisma/factories/user.js";
import type { PrismaClient } from "src/@generated/prisma/client.js";
import type { UserModel } from "src/@generated/prisma/models.js";
import { TEST_ADMIN, TEST_USER, TEST_USERS } from "test/fixtures/users.js";

const USER_COUNT = 5;

export async function seedUsers(prisma: PrismaClient) {
  await Promise.all(
    times(USER_COUNT, async () =>
      prisma.user.create({ data: await createUser() }),
    ),
  );
}

export async function seedTestUsers(
  prisma: PrismaClient,
  prefix?: string,
  password?: string,
): Promise<UserModel[]> {
  const users = [];

  for (const user of TEST_USERS) {
    if (prefix) {
      user.email = `${prefix}-${user.email}`;
    }

    const generatedUser = await prisma.user.create({
      data: await createUser({ ...user, password }),
    });
    users.push(generatedUser);
  }

  return users;
}

export async function retrieveTestUsers(prisma: PrismaClient) {
  const testAdmin = await prisma.user.findFirst({
    where: {
      email: TEST_ADMIN.email,
    },
  });
  if (!testAdmin) {
    throw new Error("Test admin not found");
  }

  const testUser = await prisma.user.findFirst({
    where: {
      email: TEST_USER.email,
    },
  });
  if (!testUser) {
    throw new Error("Test user not found");
  }

  return { testAdmin, testUser };
}
