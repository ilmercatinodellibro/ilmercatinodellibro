import {
  ConflictException,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Prisma, User } from "@prisma/client";
import { BookCopy, BookMeta } from "src/@generated";
import { Book } from "src/@generated/book";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { BookUtility } from "src/modules/book/book-utility";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { BookCreateInput, BookQueryArgs, BookQueryResult } from "./book.args";

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => BookQueryResult)
  async books(
    @Args()
    {
      page,
      rows: rowsPerPage = 50,
      filter = {},
      retailLocationId,
      withCopies,
    }: BookQueryArgs,
  ) {
    // TODO: Use Prisma full-text search
    // handle spaces by replacing them with % for the search
    const searchText = filter.search?.trim().replaceAll(" ", "%");
    const schoolCodes = filter.schoolCodes;
    const schoolCourseIds = filter.schoolCourseIds;

    if (rowsPerPage > 100) {
      throw new UnprocessableEntityException(
        "The maximum number of rows per page is 200.",
      );
    }

    const where: Prisma.BookWhereInput = {
      retailLocationId,

      ...(withCopies
        ? {
            copies: {
              some: {},
            },
          }
        : {}),

      AND: [
        // Filter for availability
        filter.isAvailable
          ? {
              meta: {
                isAvailable: true,
              },
            }
          : {},

        // Filter for sales
        filter.isSold
          ? {
              copies: {
                some: {
                  sales: {
                    some: { refundedAt: null },
                  },
                },
              },
            }
          : {},

        // Filter for problems
        filter.hasProblems
          ? {
              copies: {
                some: {
                  problems: {
                    some: { resolvedAt: null },
                  },
                },
              },
            }
          : {},
      ],

      // Filters for school codes only if defined
      ...(schoolCodes
        ? {
            courses: {
              some: {
                schoolCourse: {
                  schoolCode: {
                    in: schoolCodes,
                  },
                },
              },
            },
          }
        : {}),

      // Filters for school courses only if defined
      ...(schoolCourseIds
        ? {
            courses: {
              some: {
                schoolCourseId: {
                  in: schoolCourseIds,
                },
              },
            },
          }
        : {}),

      OR: searchText
        ? [
            {
              isbnCode: {
                startsWith: searchText,
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: searchText,
                mode: "insensitive",
              },
            },
          ]
        : undefined,
    };

    const [rowsCount, rows] = await this.prisma.$transaction([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        skip: page * rowsPerPage,
        take: rowsPerPage,
        where,
        orderBy: {
          isbnCode: "asc",
        },
      }),
    ]);

    return {
      page,
      rowsCount,
      rows,
    };
  }

  @ResolveField(() => BookMeta)
  async meta(@Root() book: Book) {
    return this.prisma.book
      .findUniqueOrThrow({
        where: {
          id: book.id,
        },
      })
      .meta();
  }

  private readonly noSalesFilter: Prisma.BookCopyWhereInput[] = [
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
  ];
  private readonly noProblemsFilter: Prisma.BookCopyWhereInput[] = [
    {
      problems: {
        none: {},
      },
    },
    {
      problems: {
        every: {
          resolvedAt: {
            not: null,
          },
        },
      },
    },
  ];
  private readonly availableCopyFilter: Prisma.BookCopyWhereInput = {
    returnedAt: null,
    donatedAt: null,
    AND: [
      {
        OR: this.noSalesFilter,
      },
      {
        OR: this.noProblemsFilter,
      },
    ],
  };

  @ResolveField(() => [BookCopy])
  async copies(
    @Root() book: Book,
    @Args("isAvailable", { defaultValue: false }) isAvailable: boolean,
  ) {
    return this.prisma.book
      .findUniqueOrThrow({
        where: { id: book.id },
      })
      .copies({
        where: isAvailable ? this.availableCopyFilter : undefined,
        orderBy: {
          code: "asc",
        },
      });
  }

  @ResolveField(() => BookUtility)
  async utility(@Root() book: Book) {
    const noConnectedSaleFilter: Prisma.IntersectOf<
      Prisma.BookRequestWhereInput | Prisma.ReservationWhereInput
    >[] = [
      {
        saleId: null,
      },
      {
        sale: {
          refundedAt: null,
        },
      },
    ];

    // Helper function to reduce duplication and improve readability
    // Since $transaction requires PrismaPromise, we couldn't simplify the result handling
    const bookRelationQuery = <
      T extends Prisma.BookCountOutputTypeSelect,
      TKey extends keyof T,
    >(
      key: TKey,
      params: T[TKey],
    ) =>
      this.prisma.book.findUniqueOrThrow({
        where: { id: book.id },
        select: {
          _count: {
            select: {
              [key]: params,
            },
          },
        },
      });

    const [
      {
        _count: { copies: booksInWarehouse },
      },
      {
        _count: { copies: booksTaken },
      },
      {
        _count: { copies: booksSold },
      },
      {
        _count: { requests: requestsTotal },
      },
      {
        _count: { requests: requestsActive },
      },
    ] = await Promise.all([
      bookRelationQuery("copies", {
        where: {
          bookId: book.id,
          ...this.availableCopyFilter,
        },
      }),
      bookRelationQuery("copies", {
        where: {
          bookId: book.id,
          OR: this.noProblemsFilter,
        },
      }),
      bookRelationQuery("copies", {
        where: {
          bookId: book.id,
          returnedAt: null,
          NOT: {
            OR: this.noSalesFilter,
          },
        },
      }),
      bookRelationQuery("requests", {
        where: {
          bookId: book.id,
          deletedAt: null,
        },
      }),
      bookRelationQuery("requests", {
        where: {
          bookId: book.id,
          deletedAt: null,
          AND: [
            {
              OR: noConnectedSaleFilter,
            },

            {
              OR: [
                {
                  reservations: {
                    none: {},
                  },
                },
                {
                  reservations: {
                    every: {
                      OR: [
                        {
                          deletedAt: null,
                        },
                        ...noConnectedSaleFilter,
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      }),
    ]);

    let utilityIndex = 0;

    switch (true) {
      // No books in the warehouse is a big bonus
      case booksInWarehouse === 0:
        utilityIndex += 1;
        break;
      // Only one book in the warehouse is a good bonus
      case booksInWarehouse === 1:
        utilityIndex += 0.7;
        break;
      // Four books in the warehouse is a little malus
      case booksInWarehouse === 4:
        utilityIndex -= 0.25;
        break;
      // Too many books in the warehouse is a severe malus
      case booksInWarehouse >= 5:
        utilityIndex -= 0.6;
        break;
    }

    // If there are no current requests we give a small malus
    if (requestsActive === 0) {
      utilityIndex -= 0.15;
    } else {
      // The more the not satisfiable requests with respect to total current requests, the more add to reach a positive index
      // If there are excess books in the warehouse not requested by anyone, it subtract more and more
      utilityIndex += (requestsActive - booksInWarehouse) / requestsActive;
    }

    // If there have never been requests we give a small malus
    if (requestsTotal === 0) {
      utilityIndex -= 0.2;
    }

    // The more these kind of books have been sold, the more they are likely to be requested again
    if (booksTaken !== 0) {
      utilityIndex += booksSold / booksTaken;
    }

    // If a book has never been taken in or requested, we add one: we want to have at least a copy of every book
    if (booksTaken === 0 && requestsTotal === 0) {
      utilityIndex += 1;
    }

    return {
      booksTaken,
      booksInWarehouse,
      booksSold,
      requestsActive,
      requestsTotal,
      value: utilityIndex,
    } satisfies BookUtility;
  }

  @Mutation(() => Book, { nullable: true })
  async createBook(
    @Input()
    {
      authorsFullName,
      isbnCode,
      originalPrice,
      publisherName,
      retailLocationId,
      subject,
      title,
    }: BookCreateInput,
    @CurrentUser() { id: userId }: User,
  ) {
    try {
      await this.prisma.locationMember.findFirstOrThrow({
        where: {
          userId,
          retailLocationId,
        },
      });
    } catch {
      throw new ConflictException(
        "You do not have permission to create books for this retail location.",
      );
    }

    const bookExistsForRetailLocation = await this.prisma.book.findFirst({
      where: {
        retailLocationId,
        isbnCode,
      },
      select: { id: true }, // only need to know if it exists
    });
    if (bookExistsForRetailLocation) {
      throw new ConflictException(
        "Book already exists for the specified retail location.",
      );
    }

    return this.prisma.book.create({
      data: {
        authorsFullName,
        isbnCode,
        originalPrice,
        publisherName,
        retailLocationId,
        subject,
        title,
      },
    });
  }
}
