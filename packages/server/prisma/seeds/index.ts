import { NestFactory } from "@nestjs/core";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { seedE2eTests } from "./e2e-tests";
import { seedEvents } from "./events";
import { seedRetailLocations } from "./retail-locations";

// Be careful about the execution/completion order with relations
// Ideally create and connect the related entities in the same seed file
async function main(prisma: PrismaService) {
  await seedRetailLocations(prisma);

  await seedE2eTests(prisma);

  await seedEvents(prisma);
}

async function run() {
  // The client needs the driver adapter that PrismaModule configures
  const nestApp = await NestFactory.create(PrismaModule, {
    logger: ["error", "warn"],
  });
  nestApp.enableShutdownHooks();

  try {
    await main(nestApp.get(PrismaService));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await nestApp.close();
  }
}

void run();
