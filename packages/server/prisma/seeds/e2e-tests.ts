import type { PrismaClient } from "src/@generated/prisma/client.js";
import { seedTestUsers } from "./users.js";

export async function seedE2eTests(prisma: PrismaClient) {
  await seedTestUsers(prisma);
}
