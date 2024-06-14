import { randomInt } from "crypto";
import { faker } from "@faker-js/faker";
import { Logger } from "@nestjs/common";
import {
  Book,
  BookCopy,
  BookRequest,
  Cart,
  Prisma,
  Reservation,
  RetailLocation,
  Sale,
} from "@prisma/client";
import { Command, CommandRunner, Option } from "nest-commander";
import { PASSWORD_STUB_HASH } from "prisma/factories/user";
import { BookCopyService } from "src/modules/book-copy/book-copy.service";
import { PrismaService } from "src/modules/prisma/prisma.service";

interface SeedUsersWithBooksCommandOptions {
  random?: number;
  clear?: boolean;
}

@Command({
  name: "seed-users-with-books",
  description:
    "Seeds the current database with some users and books movements/reservations/requests",
})
export class SeedUsersWithBooksCommand extends CommandRunner {
  private readonly logger = new Logger(SeedUsersWithBooksCommand.name);
  private readonly bookService = new BookCopyService();

  private readonly USERS_AMOUNT = 5;
  private readonly BOOKS_PER_USER_BASE = 10;
  // Displacement for the actual generated random number of books per user, above the base
  private readonly DEFAULT_RANDOM_DISPLACEMENT = 5;
  // Some character combination that is not valid in an email, to avoid matching with real data
  private readonly EMAIL_SEEDING_SUFFIX = "@@";

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  @Option({
    flags: "-r, --random [number]",
    description:
      "The amount of displacement of the random number of copies between every generated user\nAccepted values: natural numbers (default: 5)",
  })
  parseRandomDisplacement(val?: string) {
    if (
      val !== undefined &&
      (parseInt(val) <= 0 ||
        parseInt(val) !== parseFloat(val) ||
        isNaN(parseInt(val)))
    ) {
      throw new Error(
        "Invalid displacement, must be an integer greater than zero",
      );
    }
    return val !== undefined ? parseInt(val) : val;
  }

  @Option({
    flags: "-c, --clear",
    description:
      "Makes the command stop after clearing the previous seeded data",
  })
  parseNothing(_?: string) {
    return true;
  }

  async run(
    _: string[],
    options?: SeedUsersWithBooksCommandOptions,
  ): Promise<void> {
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

    if (options?.clear) {
      // Option to only clear the current seeded data
      return;
    }

    this.logger.verbose(
      `Range of copies created per user: ${this.BOOKS_PER_USER_BASE} - ${this.BOOKS_PER_USER_BASE + (options?.random ?? this.DEFAULT_RANDOM_DISPLACEMENT)}`,
    );

    for (const id of ["re", "mo"]) {
      await this.#seedRetailLocation(id, options?.random);
    }

    this.logger.log("Seeding complete");
  }

  async #seedRetailLocation(
    retailLocationId: string,
    randomDisplacement = this.DEFAULT_RANDOM_DISPLACEMENT,
  ) {
    let retailLocation: RetailLocation | undefined;
    try {
      retailLocation = await this.prisma.retailLocation.findUniqueOrThrow({
        where: {
          id: retailLocationId,
        },
      });
    } catch {
      this.logger.error(
        "Something went wrong while fetching the current location",
      );
      return;
    }

    this.logger.log(`Creating the users for ${retailLocation.name}`);

    // TODO: modify this to make seeding upsert possible
    try {
      await Promise.all(
        new Array(this.USERS_AMOUNT)
          .fill(null)
          .map((_, index) =>
            this.#createBuyerAndSeller(
              index,
              randomDisplacement,
              retailLocation,
            ),
          ),
      );
    } catch (error) {
      this.logger.error(error);
      return;
    }

    this.logger.log(`Users for ${retailLocation.name} created successfully`);
  }

  async #createBuyerAndSeller(
    index: number,
    randomDisplacement: number,
    retailLocation: RetailLocation,
  ) {
    try {
      const bookIds = (
        await this.prisma.book.findMany({
          take: randomInt(
            this.BOOKS_PER_USER_BASE,
            this.BOOKS_PER_USER_BASE + randomDisplacement,
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
        (await this.prisma.user.findUnique({
          where: {
            email: `${index + 1}-user-seller${this.EMAIL_SEEDING_SUFFIX}`,
          },
        })) ??
          (await this.prisma.user.create({
            data: {
              dateOfBirth: faker.date.past(),
              email: `${index + 1}-user-seller${this.EMAIL_SEEDING_SUFFIX}`,
              firstname: faker.person.firstName(),
              lastname: faker.person.lastName(),
              password: PASSWORD_STUB_HASH,
              phoneNumber: faker.string.numeric({ length: 10 }),
              emailVerified: true,
            },
          })),

        (await this.prisma.user.findUnique({
          where: {
            email: `${index + 1}-user-buyer${this.EMAIL_SEEDING_SUFFIX}`,
          },
        })) ??
          (await this.prisma.user.create({
            data: {
              dateOfBirth: faker.date.past(),
              email: `${index + 1}-user-buyer${this.EMAIL_SEEDING_SUFFIX}`,
              firstname: faker.person.firstName(),
              lastname: faker.person.lastName(),
              password: PASSWORD_STUB_HASH,
              phoneNumber: faker.string.numeric({ length: 10 }),
              emailVerified: true,
            },
          })),
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
        data: availableCopies.slice(0, availableCopies.length - 2).map(
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
          .slice(0, availableRequests.length - 2)
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

      const cart = await this.prisma.cart.create({
        data: {
          items: {
            create: reservations
              .slice(0, reservations.length - 2)
              .map(({ id, bookId }) => ({
                fromReservationId: id,
                bookId,
              })),
          },
          userId: buyer.id,
          createdById: buyer.id,
          retailLocationId,
        },
        include: {
          items: {
            include: {
              book: {
                include: {
                  copies: {
                    where: {
                      OR: [
                        {
                          sales: {
                            none: {},
                          },
                        },
                        {
                          sales: {
                            every: {
                              refundedAt: {
                                not: null,
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      });

      const itemsToSell = cart.items.slice(0, cart.items.length - 2);

      await this.prisma.sale.createMany({
        data: itemsToSell.map((item) => ({
          bookCopyId: item.book.copies[0].id,
          cartCreatedById: buyer.id,
          createdById: buyer.id,
          purchasedAt: new Date(),
          purchasedById: buyer.id,
        })),
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
            in: itemsToSell.map(({ book }) => book.copies[0].id),
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
      let i = 0;
      for (const sale of sales) {
        await this.#updateReservationsRequestsAndCart(sale, cart);

        if (i % 3 === 2) {
          await this.#refundBookCopy(sale, retailLocationId);
        }
        i++;
      }
    } catch (error) {
      this.logger.error("Something went wrong: ", error);
    }
  }

  async #updateReservationsRequestsAndCart(
    sale: {
      bookCopy: {
        book: {
          reservations: Reservation[];
          requests: BookRequest[];
        } & Book;
      };
    } & Sale,
    cart: Cart,
  ) {
    const book = sale.bookCopy.book;
    await this.prisma.cartItem.delete({
      where: {
        cartId_bookId: {
          bookId: book.id,
          cartId: cart.id,
        },
      },
    });

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
      true,
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
        contains: this.EMAIL_SEEDING_SUFFIX,
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
