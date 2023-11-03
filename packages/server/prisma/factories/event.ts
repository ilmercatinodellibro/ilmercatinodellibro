import { faker } from "@faker-js/faker";
import { random, startCase, times } from "lodash";
import { EventCreateInput } from "src/@generated/event";
import { createUser } from "./user";

export async function createEvent(
  overrides: Partial<EventCreateInput> = {},
): Promise<EventCreateInput> {
  return {
    name: startCase(times(random(1, 4), () => faker.word.noun()).join(" ")),
    description: faker.lorem.sentence(),

    owner: {
      create: await createUser(),
    },

    ...overrides,
  };
}
