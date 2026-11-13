import type { PrismaClient } from "src/@generated/prisma/client";
import { seedTestUsers } from "./users";

export async function seedE2eTests(prisma: PrismaClient) {
  await seedTestUsers(prisma);
}
