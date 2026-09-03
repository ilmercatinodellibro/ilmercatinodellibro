import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Prisma, Role } from "@prisma/client";
import {
  Book,
  BookCopy,
  Problem,
  ReceiptType,
  Sale,
  User,
} from "src/@generated";
import { AuthService } from "src/modules/auth/auth.service";
import {
  BookCopyCreateInput,
  DonateBookCopiesInput,
  RefundBookCopyInput,
  ReimburseBookCopiesInput,
  ReturnBookCopiesInput,
} from "src/modules/book-copy/book-copy.input";
import { ReceiptService } from "src/modules/receipt/receipt.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  BookCopyByUserQueryArgs,
  BookCopyQueryArgs,
  PaginatedBookCopiesQueryArgs,
  PaginatedBookCopyQueryResult,
} from "./book-copy.args";
import { availableBookCopyFilter } from "./book-copy.filters";
import { BookCopyService } from "./book-copy.service";

@Resolver(() => BookCopy)
export class BookCopyResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookService: BookCopyService,
    private readonly authService: AuthService,
    private readonly receiptService: ReceiptService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Query(() => [BookCopy])
  async bookCopies(@Args() { bookId }: BookCopyQueryArgs) {
    return this.prisma.bookCopy.findMany({
      where: {
        bookId,
      },
      orderBy: {
        code: "asc",
      },
    });
  }

  @Query(() => [BookCopy], {
    description: "Book copies that are owned by the user",
  })
  async bookCopiesByOwner(
    @Args() { userId: ownerId, retailLocationId }: BookCopyByUserQueryArgs,
    @CurrentUser() { id: userId }: User,
  ) {
    if (ownerId !== userId) {
      await this.authService.assertMembership({
        userId,
        retailLocationId,
        message:
          "You don't have the necessary permissions to view the book copies of another user.",
      });
    }

    return this.prisma.bookCopy.findMany({
      where: {
        ownerId,
        book: {
          retailLocationId,
        },
      },
      orderBy: {
        code: "asc",
      },
    });
  }

  @Query(() => [BookCopy], {
    description: "Book copies that are owned by the user and are in stock",
  })
  async bookCopiesInStock(
    @Args() { userId: ownerId, retailLocationId }: BookCopyByUserQueryArgs,
    @CurrentUser() { id: userId }: User,
  ) {
    if (ownerId !== userId) {
      await this.authService.assertMembership({
        userId,
        retailLocationId,
        message:
          "You don't have the necessary permissions to view the book copies of another user.",
      });
    }

    return this.prisma.bookCopy.findMany({
      where: {
        ownerId,
        book: {
          retailLocationId,
        },
        returnedAt: null,
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
      orderBy: {
        code: "asc",
      },
    });
  }

  @Query(() => [BookCopy], {
    description: "Book copies that were purchased by the user",
  })
  async purchasedBookCopies(
    @Args()
    { userId: purchasedById, retailLocationId }: BookCopyByUserQueryArgs,
    @CurrentUser() { id: userId }: User,
  ) {
    if (purchasedById !== userId) {
      await this.authService.assertMembership({
        userId,
        retailLocationId,
        message:
          "You don't have the necessary permissions to view the purchased books of another user.",
      });
    }

    return this.prisma.bookCopy.findMany({
      where: {
        sales: {
          some: {
            purchasedById,
            refundedAt: null,
          },
        },
        book: {
          retailLocationId,
        },
      },
      orderBy: {
        code: "asc",
      },
    });
  }

  @Query(() => [BookCopy], {
    description: "Book copies that belonged to the user and are currently sold",
  })
  async soldBookCopies(
    @Args() { userId: soldById, retailLocationId }: BookCopyByUserQueryArgs,
    @CurrentUser() { id: userId }: User,
  ) {
    if (soldById !== userId) {
      await this.authService.assertMembership({
        userId,
        retailLocationId,
        message:
          "You don't have the necessary permissions to view the sold books of another user.",
      });
    }

    return this.prisma.bookCopy.findMany({
      where: {
        ownerId: soldById,
        sales: {
          some: {
            refundedAt: null,
          },
        },
        book: {
          retailLocationId,
        },
      },
      orderBy: {
        code: "asc",
      },
    });
  }

  @Query(() => [BookCopy], {
    description:
      "Book copies that were returned to the user, which is the owner of the book copies",
  })
  async returnedBookCopies(
    @Args() { userId: ownerId, retailLocationId }: BookCopyByUserQueryArgs,
    @CurrentUser() { id: userId }: User,
  ) {
    if (ownerId !== userId) {
      await this.authService.assertMembership({
        userId,
        retailLocationId,
        message:
          "You don't have the necessary permissions to view the returned books of another user.",
      });
    }

    return this.prisma.bookCopy.findMany({
      where: {
        ownerId,
        returnedById: {
          not: null,
        },
        book: {
          retailLocationId,
        },
      },
      orderBy: {
        code: "asc",
      },
    });
  }

  @Query(() => PaginatedBookCopyQueryResult)
  async paginatedBookCopies(
    @Args()
    {
      page,
      rows: rowsPerPage = 100,
      filter = {},
      retailLocationId,
    }: PaginatedBookCopiesQueryArgs,
    @CurrentUser() { id: userId }: User,
  ) {
    await this.authService.assertMembership({
      userId,
      retailLocationId,
      message:
        "You don't have the necessary permissions to view the book copies for this retail location.",
    });

    // TODO: Use Prisma full-text search
    // handle spaces by replacing them with % for the search
    const searchText = filter.search?.trim().replaceAll(" ", "%");
    const {
      hasProblems: hasProblem = false,
      isAvailable = false,
      isSold = false,
    } = filter;

    const includeCopyOrStatement = hasProblem || isSold || isAvailable;

    // TODO: full text search query optimization resources to try out
    // https://stackoverflow.com/questions/1566717/postgresql-like-query-performance-variations
    // https://www.cybertec-postgresql.com/en/postgresql-more-performance-for-like-and-ilike-statements/
    // https://stackoverflow.com/a/69223762/14897369
    const where: Prisma.BookCopyWhereInput = {
      ...(searchText
        ? {
            OR: [
              {
                code: {
                  contains: searchText,
                  mode: "insensitive",
                },
              },
              {
                originalCode: {
                  contains: searchText,
                  mode: "insensitive",
                },
              },
              {
                owner: {
                  email: {
                    contains: searchText,
                    mode: "insensitive",
                  },
                },
              },
              {
                sales: {
                  some: {
                    purchasedBy: {
                      email: {
                        contains: searchText,
                        mode: "insensitive",
                      },
                    },
                    refundedAt: null,
                  },
                },
              },
              {
                book: {
                  isbnCode: {
                    startsWith: searchText,
                    mode: "insensitive",
                  },
                },
              },
              {
                book: {
                  title: {
                    contains: searchText,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
      book: {
        retailLocationId,
      },
      returnedAt: null,
      ...(includeCopyOrStatement
        ? {
            AND: [
              ...(isAvailable ? [availableBookCopyFilter] : []),
              ...(isSold
                ? [
                    {
                      sales: {
                        some: {
                          refundedAt: null,
                        },
                      },
                    },
                  ]
                : []),
              ...(hasProblem
                ? [
                    {
                      problems: {
                        some: {
                          resolvedAt: null,
                        },
                      },
                    },
                  ]
                : []),
            ],
          }
        : {}),
    };

    const [rowsCount, rows] = await this.prisma.$transaction([
      this.prisma.bookCopy.count({ where }),
      this.prisma.bookCopy.findMany({
        skip: page * rowsPerPage,
        take: rowsPerPage,
        where,
        orderBy: {
          code: "asc",
        },
      }),
    ]);

    return {
      page,
      rowsCount,
      rows,
    };
  }

  @ResolveField(() => Book)
  async book(@Root() bookCopy: BookCopy) {
    return this.prisma.bookCopy
      .findUnique({
        where: {
          id: bookCopy.id,
        },
      })
      .book();
  }

  @ResolveField(() => User)
  async owner(@Root() bookCopy: BookCopy) {
    return this.prisma.bookCopy
      .findUnique({
        where: {
          id: bookCopy.id,
        },
      })
      .owner();
  }

  @ResolveField(() => [Problem])
  async problems(@Root() bookCopy: BookCopy) {
    return this.prisma.bookCopy
      .findUnique({
        where: {
          id: bookCopy.id,
        },
      })
      .problems();
  }

  @ResolveField(() => User)
  async createdBy(@Root() bookCopy: BookCopy) {
    return this.prisma.bookCopy
      .findUnique({
        where: {
          id: bookCopy.id,
        },
      })
      .createdBy();
  }

  @ResolveField(() => User, { nullable: true })
  async returnedBy(@Root() bookCopy: BookCopy) {
    if (!bookCopy.returnedById) {
      return null;
    }

    return this.prisma.bookCopy
      .findUnique({
        where: {
          id: bookCopy.id,
        },
      })
      .returnedBy();
  }

  @ResolveField(() => User)
  async updatedBy(@Root() bookCopy: BookCopy) {
    return this.prisma.bookCopy
      .findUnique({
        where: {
          id: bookCopy.id,
        },
      })
      .updatedBy();
  }

  @ResolveField(() => [Sale])
  async sales(@Root() bookCopy: BookCopy) {
    return this.prisma.bookCopy
      .findUnique({
        where: {
          id: bookCopy.id,
        },
      })
      .sales();
  }

  @ResolveField(() => Date, { nullable: true })
  async purchasedAt(@Root() bookCopy: BookCopy) {
    const sale = await this.#getBookCopySale(bookCopy.id);
    return sale?.purchasedAt;
  }

  @ResolveField(() => User, { nullable: true })
  async purchasedBy(@Root() bookCopy: BookCopy) {
    const sale = await this.#getBookCopySale(bookCopy.id);
    return sale?.purchasedBy;
  }

  async #getBookCopySale(bookCopyId: string) {
    const sales = await this.prisma.bookCopy
      .findUnique({
        where: {
          id: bookCopyId,
        },
      })
      .sales({
        where: {
          refundedAt: null,
        },
        include: {
          // Theoretically multiple calls to this function should end up re-using the same query
          // So, always include this to not end up having different queries
          purchasedBy: true,
        },
      });

    if (!sales || sales.length === 0) {
      return null;
    }

    // TODO: maybe silently use the first sale and log an error which must be tracked carefully (?)
    if (sales.length > 1) {
      throw new InternalServerErrorException(
        "There are multiple sales for the same book copy that are not refunded. This should have not happened.",
      );
    }

    return sales[0];
  }

  @Mutation(() => [BookCopy])
  async createBookCopies(
    @Input() { bookIds, ownerId, retailLocationId }: BookCopyCreateInput,
    @CurrentUser("id") operatorId: string,
  ) {
    await this.authService.assertMembership({
      userId: operatorId,
      retailLocationId,
      message:
        "You don't have the necessary permissions to create a new book for this retail location.",
    });

    const books = await this.prisma.book.findMany({
      select: {
        id: true,
        retailLocationId: true,
      },
      where: {
        id: {
          in: bookIds,
        },
      },
    });

    if (!books.every((book) => book.retailLocationId === retailLocationId)) {
      throw new ForbiddenException(
        "You are trying to create books for a retail location for which you don't have operator permissions.",
      );
    }

    const bookCopies = await this.prisma.$transaction(async (prisma) => {
      const booksCodes = await this.bookService.calculateBookCodes(
        prisma,
        bookIds,
        retailLocationId,
      );

      await prisma.bookCopy.createMany({
        data: booksCodes.map((generatedCode, index) => ({
          bookId: bookIds[index],
          code: generatedCode,
          createdById: operatorId,
          ownerId,
          updatedById: operatorId,
        })),
      });

      // The underscore avoids variable name shadowing
      const _bookCopies = await prisma.bookCopy.findMany({
        where: {
          ownerId,
          code: {
            in: booksCodes,
          },
          book: {
            retailLocationId,
          },
        },
        include: {
          book: true,
        },
      });

      await this.receiptService.createReceipt(prisma, {
        type: ReceiptType.WITHDRAWAL,
        userId: ownerId,
        retailLocationId,
        createdById: operatorId,
        data: _bookCopies,
      });

      return _bookCopies;
    });

    this.eventEmitter.emit("booksBecameAvailable", { bookIds });

    return bookCopies;
  }

  // This hasn't been adapted to be a batch operation for now as it doesn't require generating a receipt
  // Also, the fact that deals with nested sales entities makes it harder to be converted to a batch operation
  @Mutation(() => BookCopy, {
    description: "Refund the book copy to the buyer",
  })
  async refundBookCopy(
    @Input()
    { bookCopyId, retailLocationId }: RefundBookCopyInput,
    @CurrentUser("id") operatorId: string,
  ) {
    const { bookCopies } = await this.#assertBookCopiesCanBeOperatedOn(
      [bookCopyId],
      operatorId,
      retailLocationId,
      "copiesMustBeSold",
      Role.ADMIN,
    );

    const bookCopy = bookCopies[0];

    return this.prisma.$transaction(async (prisma) => {
      const codes = await this.bookService.calculateBookCodes(
        prisma,
        [bookCopy.bookId],
        retailLocationId,
      );

      const newBookCopyCode = codes[0];
      const sale = bookCopy.sales[0];
      return prisma.bookCopy.update({
        where: {
          id: bookCopyId,
        },
        data: {
          code: newBookCopyCode,
          // Original code must be updated only the first time a book is returned, so when there is no original code set.
          ...(bookCopy.originalCode ? {} : { originalCode: bookCopy.code }),
          updatedAt: new Date(),
          updatedById: operatorId,
          sales: {
            update: {
              where: {
                id: sale.id,
              },
              data: {
                refundedAt: new Date(),
                refundedById: operatorId,
              },
            },
          },
        },
      });
    });
  }

  @Mutation(() => [BookCopy], {
    description: "Return the book copies to the owner",
  })
  async returnBookCopies(
    @Input() { bookCopyIds, retailLocationId }: ReturnBookCopiesInput,
    @CurrentUser("id") operatorId: string,
  ) {
    const { ownerId } = await this.#assertBookCopiesCanBeOperatedOn(
      bookCopyIds,
      operatorId,
      retailLocationId,
      "copiesMustNotBeSold",
    );

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.bookCopy.updateMany({
        where: {
          id: {
            in: bookCopyIds,
          },
        },
        data: {
          updatedAt: new Date(),
          updatedById: operatorId,
          returnedAt: new Date(),
          returnedById: operatorId,
        },
      });

      return this.#refreshBookCopiesAndSendReceipt(
        prisma,
        bookCopyIds,
        operatorId,
        ownerId,
        retailLocationId,
      );
    });
  }

  @Mutation(() => [BookCopy], {
    description:
      "Reimburse the owner of the book copies that got damaged/lost/etc. under Mercatino's responsibility.",
  })
  async reimburseBookCopies(
    @Input() { bookCopyIds, retailLocationId }: ReimburseBookCopiesInput,
    @CurrentUser("id") operatorId: string,
  ) {
    const { ownerId } = await this.#assertBookCopiesCanBeOperatedOn(
      bookCopyIds,
      operatorId,
      retailLocationId,
      "copiesMustNotBeSold",
    );

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.bookCopy.updateMany({
        where: {
          id: {
            in: bookCopyIds,
          },
        },
        data: {
          updatedAt: new Date(),
          updatedById: operatorId,
          reimbursedAt: new Date(),
          reimbursedById: operatorId,
        },
      });

      return this.#refreshBookCopiesAndSendReceipt(
        prisma,
        bookCopyIds,
        operatorId,
        ownerId,
        retailLocationId,
      );
    });
  }

  @Mutation(() => [BookCopy], {
    description: "Donate the book copies to the Mercatino.",
  })
  async donateBookCopies(
    @Input() { bookCopyIds, retailLocationId }: DonateBookCopiesInput,
    @CurrentUser("id") operatorId: string,
  ) {
    const { ownerId } = await this.#assertBookCopiesCanBeOperatedOn(
      bookCopyIds,
      operatorId,
      retailLocationId,
      "copiesMustNotBeSold",
    );

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.bookCopy.updateMany({
        where: {
          id: {
            in: bookCopyIds,
          },
        },
        data: {
          updatedAt: new Date(),
          updatedById: operatorId,
          donatedAt: new Date(),
          donatedById: operatorId,
        },
      });

      return this.#refreshBookCopiesAndSendReceipt(
        prisma,
        bookCopyIds,
        operatorId,
        ownerId,
        retailLocationId,
      );
    });
  }

  async #assertBookCopiesCanBeOperatedOn(
    bookCopyIds: string[],
    operatorId: string,
    retailLocationId: string,
    salesStatus: "copiesMustBeSold" | "copiesMustNotBeSold",
    role?: Role,
  ) {
    await this.authService.assertMembership({
      userId: operatorId,
      retailLocationId,
      role,
      message:
        "You don't have the necessary permissions operate on book copies of the given retail location.",
    });

    const bookCopies = await this.prisma.bookCopy.findMany({
      where: {
        id: {
          in: bookCopyIds,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
          },
        },
        book: {
          select: {
            retailLocationId: true,
          },
        },
        sales: {
          where: {
            refundedAt: null,
          },
        },
      },
    });

    if (bookCopies.length === 0) {
      throw new InternalServerErrorException(
        "No book copies has been found for the given IDs. This should have not happened.",
      );
    }

    if (
      bookCopies.some(
        (bookCopy) => bookCopy.book.retailLocationId !== retailLocationId,
      )
    ) {
      throw new InternalServerErrorException(
        "The book copies belong to different retail locations. Batch operations aren't permitted for different retail locations at the same time.",
      );
    }

    const ownerId = bookCopies[0].owner.id;

    if (bookCopies.some((bookCopy) => bookCopy.owner.id !== ownerId)) {
      throw new InternalServerErrorException(
        "The book copies have different owners. Batch operations aren't permitted for different owners at the same time.",
      );
    }

    for (const bookCopy of bookCopies) {
      switch (salesStatus) {
        case "copiesMustBeSold": {
          if (bookCopy.sales.length === 0) {
            throw new ConflictException(
              "The book copy has not been sold. It must be sold to a buyer before being operated on.",
            );
          }

          if (bookCopy.sales.length > 1) {
            throw new InternalServerErrorException(
              "There are multiple active sales for the same book copy that are not refunded. This should not have happened.",
            );
          }
          break;
        }
        case "copiesMustNotBeSold": {
          if (bookCopy.sales.length > 0) {
            throw new ConflictException(
              "The book copy has been sold. It must be refunded to the buyer before being operated on.",
            );
          }
          break;
        }
      }

      if (bookCopy.returnedAt) {
        throw new ConflictException(
          "The book copy has already been returned to its owner.",
        );
      }

      if (bookCopy.reimbursedAt) {
        throw new ConflictException(
          "The book copy has already been reimbursed to its owner.",
        );
      }

      if (bookCopy.donatedAt) {
        throw new ConflictException(
          "The book copy has already been donated to Mercatino by its owner.",
        );
      }
    }

    return { bookCopies, ownerId };
  }

  async #refreshBookCopiesAndSendReceipt(
    prisma: Prisma.TransactionClient,
    bookCopyIds: string[],
    operatorId: string,
    ownerId: string,
    retailLocationId: string,
  ) {
    const newlyUpdatedBookCopies = await prisma.bookCopy.findMany({
      where: {
        id: {
          in: bookCopyIds,
        },
      },
      include: {
        book: true,
        sales: true,
      },
      // Order copies by code to make the receipt coherent with the settlement GUI
      orderBy: {
        code: "asc",
      },
    });

    await this.receiptService.createReceipt(prisma, {
      data: newlyUpdatedBookCopies,
      createdById: operatorId,
      retailLocationId,
      type: ReceiptType.SETTLEMENT,
      userId: ownerId,
    });

    return newlyUpdatedBookCopies.map(
      // Removes relations which are only needed for the receipt generation, but aren't needed for the return value of this mutation
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      ({ book, sales, ...bookCopyToReturn }) => bookCopyToReturn,
    );
  }
}
