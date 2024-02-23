import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { random, startCase, times } from "lodash";
import { createUser } from "./user";

export async function createEvent(
  overrides: Partial<Prisma.EventCreateInput> = {},
): Promise<Prisma.EventCreateInput> {
  return {
    name: startCase(times(random(1, 4), () => faker.word.noun()).join(" ")),
    description: faker.lorem.sentence(),

    owner: {
      create: await createUser(),
    },

    ...overrides,
  };
}
