import { ForbiddenException } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Book, BookCopy, Problem, Role, Sale, User } from "src/@generated";
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
  ) {}

  @Query(() => [BookCopy])
  async bookCopiesByOwner(
    @Args()
    { userId: ownerId }: BookCopyByUserQueryArgs,
  ) {
    const currentRetailLocationId = "re"; // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    return this.prisma.bookCopy.findMany({
      where: {
        ownerId,
        book: {
          retailLocationId: currentRetailLocationId,
        },
      },
    });
  }

  @Query(() => [BookCopy])
  async purchasedBookCopies(
    @Args() { userId: purchasedById }: BookCopyByUserQueryArgs,
    @CurrentUser() { id: userId, role }: User,
  ) {
    if (purchasedById !== userId && role === Role.USER) {
      throw new ForbiddenException(
        "You don't have the necessary permissions to view the purchased books of another user.",
      );
    }

    return this.prisma.bookCopy.findMany({
      where: {
        sales: {
          some: {
            purchasedById,
            refundedAt: null,
          },
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

  @Query(() => [BookCopy])
  async bookCopies(
    @Args()
    queryArgs: BookCopyQueryArgs,
  ) {
    return this.prisma.bookCopy.findMany({
      where: {
        ...queryArgs,
      },
    });
  }

  @Mutation(() => Int, { nullable: true })
  async createBookCopies(
    @Input()
    { bookIds, ownerId }: BookCopyCreateInput,
    @CurrentUser() { id: userId, role: userRole }: User,
  ) {
    if (userRole === Role.USER) {
      throw new ForbiddenException(
        "You don't have the necessary permissions to create a new book for this retail location.",
      );
    }

    const currentRetailLocationId = "re"; // TODO: this must come from the retailLocationId for which the current logged in user is an operator. Refactor later
    const books = await this.prisma.book.findMany({
      select: {
        id: true,
        retailLocationId: true, // TODO: must add a control for the locationId
      },
      where: {
        id: {
          in: bookIds,
        },
      },
    });

    if (
      !books.every((book) => book.retailLocationId === currentRetailLocationId)
    ) {
      throw new ForbiddenException(
        "You are trying to create books for a retail location for which you don't have operator permissions.",
      );
    }

    const bookCopies = await this.prisma.$transaction(async (prisma) => {
      const booksCodes = await this.bookService.calculateBookCodes(
        prisma,
        bookIds,
        currentRetailLocationId,
      );

      return prisma.bookCopy.createMany({
        data: booksCodes.map((generatedCode, index) => ({
          bookId: bookIds[index],
          code: generatedCode,
          createdById: userId,
          ownerId,
          updatedById: userId,
        })),
      });
    });

    return bookCopies.count;
  }
}
