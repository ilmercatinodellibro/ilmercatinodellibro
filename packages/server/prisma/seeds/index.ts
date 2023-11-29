import { PrismaClient } from "@prisma/client";
import { seedE2eTests } from "./e2e-tests";
import { seedEvents } from "./events";
import { seedRetailLocations } from "./retail-locations";

// Prisma doesn't export a specific type for this. We need it because we are passing the client around within transactions.
export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const prisma = new PrismaClient();

// Be careful about the execution/completion order with relations
// Ideally create and connect the related entities in the same seed file
async function main() {
  await seedE2eTests(prisma);

  await seedEvents(prisma);

  await seedRetailLocations(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
