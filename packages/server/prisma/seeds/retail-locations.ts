import { PrismaClient } from "@prisma/client";
import retailLocations from "test/fixtures/retail-locations";

export async function seedRetailLocations(prisma: PrismaClient) {
  await Promise.all(
    retailLocations.map((location) =>
      prisma.retailLocation.create({ data: location }),
    ),
  );
}
