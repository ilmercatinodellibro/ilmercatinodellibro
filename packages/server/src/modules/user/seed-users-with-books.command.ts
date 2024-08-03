import { randomInt } from "crypto";
import { faker } from "@faker-js/faker";
import { Logger } from "@nestjs/common";
import {
  Book,
  BookCopy,
  BookRequest,
  Prisma,
  Reservation,
  RetailLocation,
  Sale,
} from "@prisma/client";
import { cloneDeep, find, remove, toInteger } from "lodash";
import { Command, CommandRunner, Option } from "nest-commander";
import { PASSWORD_STUB_HASH } from "prisma/factories/user";
import { BookCopyService } from "src/modules/book-copy/book-copy.service";
import { PrismaService } from "src/modules/prisma/prisma.service";

interface SeedUsersWithBooksCommandOptions {
  additionalBooksPerUser: number;
  clear: boolean;
  usersCount: number;
}

const BOOKS_PER_USER_BASE = 10;
const EMAIL_SEEDING_SUFFIX = "@example-generated.com";
// For each step in generation, we leave 2 items to not be processed in that step so that we have records for all of them
const ITEMS_TO_NOT_PROCESS_COUNT = 2;

const DEFAULT_USERS_COUNT = 5;
// How many copies above the base when generating user book copies
const DEFAULT_ADDITIONAL_BOOKS_PER_USER = 5;

function composeUserEmail(index: number, role: string, location: string) {
  return `${location}-user-${role}-${index + 1}${EMAIL_SEEDING_SUFFIX}`;
}

@Command({
  name: "seed-users-with-books",
  description:
    "Seeds the current database with some users and books movements/reservations/requests",
})
export class SeedUsersWithBooksCommand extends CommandRunner {
  private readonly logger = new Logger(SeedUsersWithBooksCommand.name);
  private readonly bookService = new BookCopyService();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  @Option({
    flags: "-b, --additionalBooksPerUser [number]",
    description:
      "The amount of book copies which could be generated per user\nAccepted values: natural numbers (default: 5)",
  })
  parseAdditionalBooksPerUsers(val?: string) {
    const parsedInteger = toInteger(val);

    if (parsedInteger > 0) {
      return parsedInteger;
    }

    throw new Error(
      "Invalid value for `additionalBooksPerUser` option, must be an integer greater than zero",
    );
  }

  @Option({
    flags: "-c, --clear",
    description:
      "Makes the command stop after clearing the previously seeded data",
  })
  parseNothing(_?: string) {
    return true;
  }

  @Option({
    flags: "-u, --users [number]",
    description:
      "How many users should be generated\nAccepted values: natural numbers (default: 5)",
  })
  parseUsers(val?: string) {
    const parsedInteger = toInteger(val);

    if (parsedInteger > 0) {
      return parsedInteger;
    }

    throw new Error(
      "Invalid value for `users` option, must be an integer greater than zero",
    );
  }

  async run(
    _: string[],
    userOptions: Partial<SeedUsersWithBooksCommandOptions> = {},
  ): Promise<void> {
    const options: SeedUsersWithBooksCommandOptions = {
      additionalBooksPerUser:
        userOptions.additionalBooksPerUser ?? DEFAULT_ADDITIONAL_BOOKS_PER_USER,
      clear: userOptions.clear ?? false,
      usersCount: userOptions.usersCount ?? DEFAULT_USERS_COUNT,
    };

    // TODO: make the clear of the seeded users optional once seeding upsert is allowed
    try {
      await this.#clearRetailLocationSeededUsers();
    } catch (error) {
      this.logger.error(
        "There was a problem while cleaning any previously seeded users",
        error,
      );
      return;
    }

    this.logger.log("Seed data erased successfully");

    if (options.clear) {
      // Option to only clear the current seeded data
      return;
    }

    this.logger.verbose(
      `Range of copies created per user: ${BOOKS_PER_USER_BASE} - ${BOOKS_PER_USER_BASE + options.additionalBooksPerUser}`,
    );

    for (const id of ["re", "mo"]) {
      const { _count, name } =
        await this.prisma.retailLocation.findFirstOrThrow({
          where: {
            id,
          },
          include: {
            _count: {
              select: {
                books: true,
              },
            },
          },
        });

      if (_count.books < BOOKS_PER_USER_BASE + options.additionalBooksPerUser) {
        this.logger.error(
          `The number of additional books per user is too high for the amount of books present in the warehouse of ${name}. The maximum is ${_count.books - BOOKS_PER_USER_BASE}`,
        );
        return;
      }
      await this.#seedRetailLocation(id, options);
    }

    this.logger.log("Seeding complete");
  }

  async #seedRetailLocation(
    retailLocationId: string,
    options: Required<SeedUsersWithBooksCommandOptions>,
  ) {
    const retailLocation = await this.prisma.retailLocation.findUnique({
      where: {
        id: retailLocationId,
      },
    });

    if (!retailLocation) {
      this.logger.error(
        "Something went wrong while fetching the current location",
      );
      return;
    }

    this.logger.log(`Creating the users for ${retailLocation.name}`);

    // TODO: modify this to make seeding upsert possible
    try {
      for (let index = 0; index < options.usersCount; index++) {
        await this.#createBuyerAndSeller(
          index,
          options.additionalBooksPerUser,
          retailLocation,
        );
      }
    } catch (error) {
      this.logger.error(error);
      return;
    }

    this.logger.log(`Users for ${retailLocation.name} created successfully`);
  }

  async #createBuyerAndSeller(
    index: number,
    additionalBooksPerUser: number,
    retailLocation: RetailLocation,
  ) {
    try {
      const bookIds = (
        await this.prisma.book.findMany({
          take: randomInt(
            BOOKS_PER_USER_BASE,
            BOOKS_PER_USER_BASE + additionalBooksPerUser,
          ),
          where: {
            retailLocationId: retailLocation.id,
            copies: {
              none: {},
            },
          },
          orderBy: {
            isbnCode: "asc",
          },
        })
      ).map(({ id }) => id);

      if (bookIds.length === 0) {
        throw new Error(
          "Import books into the database before calling this command.",
        );
      }

      const [seller, buyer] = await Promise.all([
        await this.prisma.user.create({
          data: {
            dateOfBirth: faker.date.past(),
            email: composeUserEmail(index, "seller", retailLocation.id),
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            password: PASSWORD_STUB_HASH,
            phoneNumber: faker.string.numeric({ length: 10 }),
            emailVerified: true,
          },
        }),

        await this.prisma.user.create({
          data: {
            dateOfBirth: faker.date.past(),
            email: composeUserEmail(index, "buyer", retailLocation.id),
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            password: PASSWORD_STUB_HASH,
            phoneNumber: faker.string.numeric({ length: 10 }),
            emailVerified: true,
          },
        }),
      ]);

      const retailLocationId = retailLocation.id;

      const booksCodes = await this.bookService.calculateBookCodes(
        this.prisma,
        bookIds,
        retailLocationId,
      );

      await this.prisma.bookCopy.createMany({
        data: booksCodes.map((code, bookIndex) => ({
          ownerId: seller.id,
          createdById: seller.id,
          bookId: bookIds[bookIndex],
          updatedById: seller.id,
          code,
        })),
      });

      const availableCopies = await this.prisma.bookCopy.findMany({
        where: {
          ownerId: seller.id,
          book: {
            id: {
              in: bookIds,
            },
            retailLocationId,
          },
        },
      });

      await this.prisma.bookRequest.createMany({
        data: availableCopies.slice(0, -ITEMS_TO_NOT_PROCESS_COUNT).map(
          ({ bookId }) =>
            ({
              bookId,
              createdById: buyer.id,
              userId: buyer.id,
            }) satisfies Prisma.BookRequestCreateManyInput,
        ),
      });

      const availableRequests = await this.prisma.bookRequest.findMany({
        where: {
          bookId: {
            in: bookIds,
          },
          userId: buyer.id,
          saleId: null,
        },
      });

      await this.prisma.reservation.createMany({
        data: availableRequests
          .slice(0, -ITEMS_TO_NOT_PROCESS_COUNT)
          .map(({ bookId, id }) => ({
            requestId: id,
            bookId,
            createdById: buyer.id,
            expiresAt: new Date(
              Date.now() + retailLocation.maxBookingDays * 24 * 60 * 60 * 1000,
            ),
            userId: buyer.id,
          })),
      });

      const reservations = await this.prisma.reservation.findMany({
        where: {
          userId: buyer.id,
          request: {
            userId: buyer.id,
            saleId: null,
          },
          bookId: {
            in: bookIds,
          },
        },
      });

      const sellableCopies = cloneDeep(availableCopies);
      const soldCopiesIds: string[] = [];

      await this.prisma.sale.createMany({
        data: reservations
          .slice(0, -ITEMS_TO_NOT_PROCESS_COUNT)
          .map((reservation) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const bookCopy = find(
              sellableCopies,
              ({ bookId }) => bookId === reservation.bookId,
            )!;
            remove(availableCopies, bookCopy);
            soldCopiesIds.push(bookCopy.id);

            return {
              bookCopyId: bookCopy.id,
              cartCreatedById: buyer.id,
              createdById: buyer.id,
              purchasedAt: new Date(),
              purchasedById: buyer.id,
            };
          }),
      });

      const sales = await this.prisma.sale.findMany({
        where: {
          bookCopy: {
            book: {
              retailLocationId,
            },
          },
          purchasedById: buyer.id,
          bookCopyId: {
            in: soldCopiesIds,
          },
        },
        include: {
          bookCopy: {
            include: {
              book: {
                include: {
                  requests: true,
                  reservations: true,
                },
              },
              sales: true,
            },
          },
        },
      });

      // Connect requests and reservations to the sales
      await Promise.all(
        sales.map(async (sale, i) => {
          await this.#updateReservationsRequests(sale);

          if (i % 3 === 2) {
            await this.#refundBookCopy(sale, retailLocationId);
          }
        }),
      );
    } catch (error) {
      this.logger.error("Something went wrong: ", error);
    }
  }

  async #updateReservationsRequests(
    sale: {
      bookCopy: {
        book: {
          reservations: Reservation[];
          requests: BookRequest[];
        } & Book;
      };
    } & Sale,
  ) {
    const book = sale.bookCopy.book;

    if (book.requests.length > 0) {
      const request = book.requests.find(
        ({ userId, saleId }) =>
          userId === sale.purchasedById && saleId === null,
      );
      if (!request) {
        throw new Error(
          `Could not update the request associated with this book: ${book.id}`,
        );
      }

      await this.prisma.bookRequest.update({
        where: { id: request.id },
        data: {
          saleId: sale.id,
        },
      });
    }

    if (book.reservations.length > 0) {
      const reservation = book.reservations.find(
        ({ userId, saleId }) =>
          userId === sale.purchasedById && saleId === null,
      );
      if (!reservation) {
        throw new Error(
          `Could not update the request associated with this book: ${book.id}`,
        );
      }

      await this.prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          saleId: sale.id,
        },
      });
    }
  }

  async #refundBookCopy(
    { id, bookCopyId, bookCopy }: Sale & { bookCopy: BookCopy },
    retailLocationId: string,
  ) {
    const [newBookCopyCode] = await this.bookService.calculateBookCodes(
      this.prisma,
      [bookCopy.bookId],
      retailLocationId,
    );

    return this.prisma.bookCopy.update({
      where: {
        id: bookCopyId,
      },
      data: {
        code: newBookCopyCode,
        // Original code must be updated only the first time a book is returned, so when there is no original code set.
        ...(bookCopy.originalCode ? {} : { originalCode: bookCopy.code }),
        updatedAt: new Date(),
        sales: {
          update: {
            where: {
              id,
            },
            data: {
              refundedAt: new Date(),
            },
          },
        },
      },
    });
  }

  async #clearRetailLocationSeededUsers() {
    // For filtering for the seeded users
    const seedUserFilter = {
      email: {
        contains: EMAIL_SEEDING_SUFFIX,
      },
    };

    await this.prisma.sale.deleteMany({
      where: {
        purchasedBy: seedUserFilter,
      },
    });

    await this.prisma.cart.deleteMany({
      where: {
        user: seedUserFilter,
      },
    });

    await this.prisma.reservation.deleteMany({
      where: {
        user: seedUserFilter,
      },
    });

    await this.prisma.bookRequest.deleteMany({
      where: {
        user: seedUserFilter,
      },
    });

    await this.prisma.bookCopy.deleteMany({
      where: {
        owner: seedUserFilter,
      },
    });

    await this.prisma.user.deleteMany({
      where: seedUserFilter,
    });
  }
}
