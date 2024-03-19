import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import * as argon2 from "argon2";
import RETAIL_LOCATIONS from "test/fixtures/retail-locations";
import { SeedUserCreateInput } from "test/fixtures/users";

// Correspond to "longSecret123!" encoded with argon2id defaults
// See https://github.com/ranisalt/node-argon2/blob/e16fde8f1d2fff63803558e72ba043b85564eec9/argon2.js#L15-L23
export const PASSWORD_STUB_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$3S7CSbDtcAUVF1hcrMDkQw$Kx69jwO1b+VjdM5uILwtRHLdEwscdidcapNZjGevvm8";

export async function createUser({
  hashedPassword = PASSWORD_STUB_HASH,
  password,
  role,
  ...overrides
}: SeedUserCreateInput & {
  hashedPassword?: string;
} = {}): Promise<Prisma.UserCreateInput> {
  if (password) {
    hashedPassword = await argon2.hash(password);
  }

  return {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    email: faker.helpers.unique(faker.internet.email).toLowerCase(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: hashedPassword,
    createdAt: faker.date.past(),
    ...overrides,

    ...(role
      ? {
          memberships: {
            create: RETAIL_LOCATIONS.map((location) => ({
              retailLocationId: location.id,
              role,
            })),
          },
        }
      : {}),
  };
}
