import type { PrismaClient } from "src/@generated/prisma/client.js";
import retailLocations from "test/fixtures/retail-locations.js";

export async function seedRetailLocations(prisma: PrismaClient) {
  await Promise.all(
    retailLocations.map((location) =>
      prisma.retailLocation.create({ data: location }),
    ),
  );
}
