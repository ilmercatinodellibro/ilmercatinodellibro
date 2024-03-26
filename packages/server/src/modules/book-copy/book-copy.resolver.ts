import {
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import {
  Book,
  BookCopy,
  Problem,
  ReceiptType,
  Sale,
  User,
} from "src/@generated";
import { AuthService } from "src/modules/auth/auth.service";
import { ReceiptService } from "src/modules/receipt/receipt.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  BookCopyByUserQueryArgs,
  BookCopyCreateInput,
  BookCopyQueryArgs,
} from "./book-copy.args";
import { BookCopyService } from "./book-copy.service";

@Resolver(() => BookCopy)
export class BookCopyResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookService: BookCopyService,
    private readonly authService: AuthService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Query(() => [BookCopy])
  async bookCopies(@Args() { bookId }: BookCopyQueryArgs) {
    return this.prisma.bookCopy.findMany({
      where: {
        bookId,
      },
    });
  }

  @Query(() => [BookCopy], {
    description: "Book copies that are owned by the user and is in stock",
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
    });
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

  @Mutation(() => Int, { nullable: true })
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
        },
        include: {
          book: true,
        },
      });
    });

    await this.receiptService.createReceipt({
      type: ReceiptType.REGISTRATION,
      userId: ownerId,
      retailLocationId,
      createdById: userId,
      data: bookCopies,
    });

    return bookCopies.length;
  }
}
