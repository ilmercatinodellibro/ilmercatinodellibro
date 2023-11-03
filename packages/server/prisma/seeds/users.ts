import { PrismaClient, Role, User } from "@prisma/client";
import { times } from "lodash";
import { createUser } from "prisma/factories/user";
import { TEST_USERS } from "test/fixtures/users";

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
): Promise<User[]> {
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
      role: Role.ADMIN,
    },
  });

  if (!testAdmin) {
    throw new Error("Test admin not found");
  }

  const testUser = await prisma.user.findFirst({
    where: {
      role: Role.USER,
    },
  });

  if (!testUser) {
    throw new Error("Test user not found");
  }

  return { testAdmin, testUser };
}
