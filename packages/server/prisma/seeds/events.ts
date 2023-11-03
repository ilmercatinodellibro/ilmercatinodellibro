import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { times } from "lodash";
import { createEvent } from "prisma/factories/event";

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
