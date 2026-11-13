import { faker } from "@faker-js/faker";
import { times } from "lodash";
import { createEvent } from "prisma/factories/event";
import type { PrismaClient } from "src/@generated/prisma/client";

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
