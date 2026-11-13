import type { Prisma } from "src/@generated/prisma/client";
import { Role } from "src/@generated/prisma/enums";

export function getPrismaRetailLocationFilters(retailLocationId: string) {
  const retailLocationFilter = {
    book: {
      retailLocationId,
    },
  };

  const notAdminUser = {
    memberships: {
      none: {
        // An admin in a retail location could possibly be a normal user in another one
        retailLocationId,
        role: Role.ADMIN,
      },
    },
  } satisfies Prisma.UserWhereInput;

  const activeUsersFilter = {
    OR: [
      // Requested at least one book
      {
        requestedBooks: {
          some: {
            ...retailLocationFilter,
            deletedAt: null,
          },
        },
      },
      // Gave in at least one book
      {
        bookCopies: {
          some: {
            ...retailLocationFilter,
          },
        },
      },
    ],
    ...notAdminUser,
  } satisfies Prisma.UserWhereInput;

  return {
    retailLocationFilter,
    notAdminUser,
    activeUsersFilter,
  };
}
