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
      rows: rowsPerPage = 100,
      filter = {},
      retailLocationId,
    }: BookQueryArgs,
  ) {
    // TODO: Use Prisma full-text search
    // handle spaces by replacing them with % for the search
    const searchText = filter.search?.trim().replaceAll(" ", "%");

    if (rowsPerPage > 200) {
      throw new UnprocessableEntityException(
        "The maximum number of rows per page is 200.",
      );
    }

    const where: Prisma.BookWhereInput = {
      retailLocationId,

      meta: {
        isAvailable: filter.isAvailable,
      },

      OR: searchText
        ? [
            {
              authorsFullName: {
                contains: searchText,
                mode: "insensitive",
              },
            },
            {
              isbnCode: {
                contains: searchText,
                mode: "insensitive",
              },
            },
            {
              publisherName: {
                contains: searchText,
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: searchText,
                mode: "insensitive",
              },
            },
            {
              subject: {
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
          resolvedAt: null,
        },
      },
    },
  ];
  private readonly availableCopyFilter: Prisma.BookCopyWhereInput = {
    returnedAt: null,
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
      });
  }

  @ResolveField(() => Number)
  async utility(@Root() book: Book) {
    /*
      TODO: Return all the necessary fields to satisfy the description field below

      return [
        'level' => ($utility_index > 1) ? 'good' : (($utility_index <= 0.4) ? 'bad' : 'medium'),
        // This piece needs to be viewed by Operators and Admins when they hover the
        // cursor on top of the book utility index chip in the UI
        'description' => 'In warehouse: ' . $booksInWarehouse .
          ' | All: ' . $booksTaken .
          ' | Sold: ' . $booksSold .
          ' | Current requests: ' . $booksRequestedCurrent .
          ' | Richieste totali: ' . $booksRequestedTotal .
          ' | Indice di utilità stimata: ' . $utility_index,
      ];
    */

    const noConnectedSaleFilter: Prisma.IntersectOf<
      Prisma.BookRequestWhereInput | Prisma.ReservationWhereInput
    >[] = [
      {
        saleId: null,
      },
      {
        sale: {
          refundedAt: {
            not: null,
          },
        },
      },
    ];

    // TODO: optimize using Fluent API
    const [
      booksInWarehouse,
      booksTaken,
      booksSold,
      booksRequestedTotal,
      booksRequestedActive,
    ] = await this.prisma.$transaction([
      this.prisma.bookCopy.count({
        where: {
          bookId: book.id,
          ...this.availableCopyFilter,
        },
      }),
      this.prisma.bookCopy.count({
        where: {
          bookId: book.id,
          OR: this.noProblemsFilter,
        },
      }),
      this.prisma.bookCopy.count({
        where: {
          bookId: book.id,
          returnedAt: null,
          NOT: {
            OR: this.noSalesFilter,
          },
        },
      }),
      this.prisma.bookRequest.count({
        where: {
          bookId: book.id,
        },
      }),
      this.prisma.bookRequest.count({
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
                      OR: noConnectedSaleFilter,
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
    if (booksRequestedActive === 0) {
      utilityIndex -= 0.15;
    } else {
      // The more the not satisfiable requests with respect to total current requests, the more add to reach a positive index
      // If there are excess books in the warehouse not requested by anyone, it subtract more and more
      utilityIndex +=
        (booksRequestedActive - booksInWarehouse) / booksRequestedActive;
    }

    // If there have never been requests we give a small malus
    if (booksRequestedTotal === 0) {
      utilityIndex -= 0.2;
    }

    // The more these kind of books have been sold, the more they are likely to be requested again
    if (booksTaken !== 0) {
      utilityIndex += booksSold / booksTaken;
    }

    // If a book has never been taken in or requested, we add one: we want to have at least a copy of every book
    if (booksTaken === 0 && booksRequestedTotal === 0) {
      utilityIndex += 1;
    }

    return utilityIndex;
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
