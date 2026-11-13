import { faker } from "@faker-js/faker";
import { times } from "lodash-es";
import { createEvent } from "prisma/factories/event.js";
import type { PrismaClient } from "src/@generated/prisma/client.js";

const EVENT_COUNT = 25;

export async function seedEvents(prisma: PrismaClient) {
  const users = await prisma.user.findMany();

  await Promise.all(
    times(EVENT_COUNT, async () =>
      prisma.event.create({
        data: await createEvent({
          owner: {
            connect: {
              id: faker.helpers.arrayElement(users).id,
            },
          },
        }),
      }),
    ),
  );
}
