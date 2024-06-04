import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { random, startCase, times } from "lodash";
import RETAIL_LOCATIONS from "test/fixtures/retail-locations";
import { createUser } from "./user";

export async function createEvent(
  overrides: Partial<Prisma.EventCreateInput> = {},
): Promise<Prisma.EventCreateInput> {
  return {
    name: startCase(times(random(1, 4), () => faker.word.noun()).join(" ")),
    description: faker.lorem.sentence(),

    owner: {
      // TODO: Do not create a user, use an existing one
      create: await createUser(),
    },

    location: {
      connect: {
        id: RETAIL_LOCATIONS[random(0, RETAIL_LOCATIONS.length - 1)].id,
      },
    },

    ...overrides,
  };
}
