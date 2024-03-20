import { PrismaClient } from "@prisma/client";
import { seedE2eTests } from "./e2e-tests";
import { seedEvents } from "./events";
import { seedRetailLocations } from "./retail-locations";

const prisma = new PrismaClient();

// Be careful about the execution/completion order with relations
// Ideally create and connect the related entities in the same seed file
async function main() {
  await seedRetailLocations(prisma);

  await seedE2eTests(prisma);

  await seedEvents(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
