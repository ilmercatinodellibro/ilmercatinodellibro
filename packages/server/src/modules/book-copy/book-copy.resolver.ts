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
import { Prisma } from "@prisma/client";
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
  DonateBookCopyInput,
  RefundBookCopyInput,
  ReimburseBookCopyInput,
  ReturnBookCopyInput,
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
        returnedAt: null,
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
      // TODO: it includes all available books, instead of adding this as and additional filter
      ...(includeCopyOrStatement
        ? {
            OR: [
              ...(isAvailable
                ? ([
                    {
                      problems: {
                        every: {
                          resolvedAt: {
                            not: null,
                          },
                        },
                      },
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
                  ] satisfies Prisma.BookCopyWhereInput[])
                : []),
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
    @CurrentUser() { id: userId }: User,
  ) {
    await this.authService.assertMembership({
      userId,
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
          createdById: userId,
          ownerId,
          updatedById: userId,
        })),
      });

      return prisma.bookCopy.findMany({
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
    });

    await this.receiptService.createReceipt({
      type: ReceiptType.WITHDRAWAL,
      userId: ownerId,
      retailLocationId,
      createdById: userId,
      data: bookCopies,
    });

    this.eventEmitter.emit("booksBecameAvailable", { bookIds });

    return bookCopies;
  }

  // Consider checking for donated book copies, as they can technically no longer be reimbursed or returned
  // Left out for now as donations should only ever occur at the end of the Mercatino's activity period
  @Mutation(() => BookCopy, {
    description: "Refund the book copy to the buyer",
  })
  async refundBookCopy(
    @Input() { bookCopyId, retailLocationId }: RefundBookCopyInput,
    @CurrentUser() { id: userId }: User,
  ) {
    const bookCopy = await this.prisma.bookCopy.findUniqueOrThrow({
      where: {
        id: bookCopyId,
      },
      include: {
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

    await this.authService.assertMembership({
      userId,
      retailLocationId: bookCopy.book.retailLocationId,
      message:
        "You don't have the necessary permissions to refund this book copy.",
    });

    if (bookCopy.sales.length === 0) {
      throw new ConflictException("The book copy has not been sold.");
    }

    if (bookCopy.sales.length > 1) {
      throw new InternalServerErrorException(
        "There are multiple active sales for the same book copy that are not refunded. This should not have happened.",
      );
    }

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
          updatedById: userId,
          sales: {
            update: {
              where: {
                id: sale.id,
              },
              data: {
                refundedAt: new Date(),
                refundedById: userId,
              },
            },
          },
        },
      });
    });
  }

  @Mutation(() => BookCopy, {
    description: "Return the book copy to the owner",
  })
  async returnBookCopy(
    @Input() { bookCopyId }: ReturnBookCopyInput,
    @CurrentUser() { id: userId }: User,
  ) {
    const bookCopy = await this.prisma.bookCopy.findUniqueOrThrow({
      where: {
        id: bookCopyId,
      },
      include: {
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

    await this.authService.assertMembership({
      userId,
      retailLocationId: bookCopy.book.retailLocationId,
      message:
        "You don't have the necessary permissions to return this book copy.",
    });

    if (bookCopy.sales.length > 0) {
      throw new ConflictException(
        "The book copy has been sold. It must be refunded to the buyer first, before it can be returned to the owner.",
      );
    }

    if (bookCopy.returnedAt) {
      throw new ConflictException("The book copy has already been returned.");
    }

    if (bookCopy.reimbursedAt) {
      throw new ConflictException("The book copy has already been reimbursed.");
    }

    return this.prisma.bookCopy.update({
      where: {
        id: bookCopyId,
      },
      data: {
        updatedAt: new Date(),
        updatedById: userId,
        returnedAt: new Date(),
        returnedById: userId,
      },
    });
  }

  @Mutation(() => BookCopy, {
    description:
      "Reimburse the owner of the book copy that got damaged/lost/etc. under Mercatino's responsibility.",
  })
  async reimburseBookCopy(
    @Input() { bookCopyId }: ReimburseBookCopyInput,
    @CurrentUser() { id: userId }: User,
  ) {
    const bookCopy = await this.prisma.bookCopy.findUniqueOrThrow({
      where: {
        id: bookCopyId,
      },
      include: {
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

    await this.authService.assertMembership({
      userId,
      retailLocationId: bookCopy.book.retailLocationId,
      message:
        "You don't have the necessary permissions to reimburse this book copy.",
    });

    if (bookCopy.sales.length > 0) {
      throw new ConflictException(
        "The book copy has been sold. It must be refunded to the buyer first, before it can be reimbursed to the owner.",
      );
    }

    if (bookCopy.reimbursedAt) {
      throw new ConflictException("The book copy has already been reimbursed.");
    }

    if (bookCopy.returnedAt) {
      throw new ConflictException("The book copy has already been returned.");
    }

    return this.prisma.bookCopy.update({
      where: {
        id: bookCopyId,
      },
      data: {
        updatedAt: new Date(),
        updatedById: userId,
        reimbursedAt: new Date(),
        reimbursedById: userId,
      },
    });
  }

  @Mutation(() => BookCopy, {
    description: "Donate the book copy to the Mercatino.",
  })
  async donateBookCopy(
    @Input() { bookCopyId }: DonateBookCopyInput,
    @CurrentUser() { id: userId }: User,
  ) {
    const bookCopy = await this.prisma.bookCopy.findUniqueOrThrow({
      where: {
        id: bookCopyId,
      },
      include: {
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

    await this.authService.assertMembership({
      userId,
      retailLocationId: bookCopy.book.retailLocationId,
      message:
        "You don't have the necessary permissions to donate this book copy.",
    });

    if (bookCopy.sales.length > 0) {
      throw new ConflictException(
        "The book copy has been sold. It must be refunded to the buyer first, before it can be reimbursed to the owner.",
      );
    }

    if (bookCopy.returnedAt) {
      throw new ConflictException("The book copy has already been returned.");
    }

    if (bookCopy.reimbursedAt) {
      throw new ConflictException("The book copy has already been reimbursed.");
    }

    if (bookCopy.donatedAt) {
      throw new ConflictException("The book copy has already been donated.");
    }

    return this.prisma.bookCopy.update({
      where: {
        id: bookCopy.id,
      },
      data: {
        updatedAt: new Date(),
        updatedById: userId,
        donatedAt: new Date(),
        donatedById: userId,
      },
    });
  }
}
