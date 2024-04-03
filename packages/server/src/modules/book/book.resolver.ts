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

  @ResolveField(() => [BookCopy])
  async copies(
    @Root() book: Book,
    @Args("isAvailable", { defaultValue: false }) isAvailable: boolean,
  ) {
    const availableFilter: Prisma.BookCopyWhereInput = {
      returnedAt: null,
      AND: [
        {
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

        {
          OR: [
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
          ],
        },
      ],
    };

    return this.prisma.book
      .findUniqueOrThrow({
        where: { id: book.id },
      })
      .copies({
        where: isAvailable ? availableFilter : undefined,
      });
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
