import {
  ForbiddenException,
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
import { Prisma } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { Role } from "src/@generated";
import { User } from "src/@generated/user";
import { LocationBoundQueryArgs } from "src/modules/retail-location";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  RemoveUserPayload,
  UpdateRolePayload,
  UsersQueryArgs,
  UsersQueryResult,
} from "./user.args";
import { UserService } from "./user.service";

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => UsersQueryResult)
  async users(
    @Args() { page, rowsPerPage, searchTerm }: UsersQueryArgs,
    @CurrentUser() user: User,
  ) {
    if (rowsPerPage > 200) {
      throw new UnprocessableEntityException(
        "The maximum number of rows per page is 200.",
      );
    }

    try {
      await this.prisma.locationMember.findFirstOrThrow({
        where: {
          userId: user.id,
        },
      });
    } catch {
      throw new ForbiddenException(
        "You are not allowed to view the list of users.",
      );
    }

    // TODO: Use Prisma full-text search
    // handle spaces by replacing them with % for the search
    const searchText = searchTerm?.trim().replaceAll(" ", "%");
    const searchFilter: Prisma.StringFilter<"User"> = {
      contains: searchText,
      mode: "insensitive",
    };

    const where: Prisma.UserWhereInput = {
      emailVerified: true,

      ...(searchText
        ? {
            OR: [
              {
                firstname: searchFilter,
              },
              {
                lastname: searchFilter,
              },
              {
                email: searchFilter,
              },
              {
                phoneNumber: searchFilter,
              },
            ],
          }
        : {}),
    };

    const [rowsCount, rows] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
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

  @Query(() => [User])
  async members(
    @Args() { retailLocationId }: LocationBoundQueryArgs,
    @CurrentUser() user: User,
  ) {
    try {
      await this.prisma.locationMember.findFirstOrThrow({
        where: {
          userId: user.id,
          retailLocationId,
        },
      });
    } catch {
      throw new ForbiddenException(
        "You are not allowed to view the list of members for this location.",
      );
    }

    return this.prisma.user.findMany({
      where: {
        memberships: {
          some: {
            retailLocationId,
          },
        },
      },
    });
  }

  @ResolveField(() => Role, { nullable: true })
  async role(
    @Root() user: User,
    @Args() { retailLocationId }: LocationBoundQueryArgs,
  ) {
    const memberships = await this.prisma.user
      .findUniqueOrThrow({
        where: {
          id: user.id,
        },
      })
      .memberships({
        where: {
          retailLocationId,
        },
      });

    return memberships[0]?.role;
  }

  @ResolveField(() => Number)
  async booksInStock(@Root() user: User) {
    // findUnique still avoids the n+1 problem, even if not using fluent API.
    // Since we only need the count, we use select._count instead of fluent API.
    const { _count } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
      select: {
        _count: {
          select: {
            bookCopies: {
              where: {
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
            },
          },
        },
      },
    });

    return _count.bookCopies;
  }

  @ResolveField(() => Number)
  async booksSold(@Root() user: User) {
    const { _count } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
      select: {
        _count: {
          select: {
            bookCopies: {
              where: {
                sales: {
                  some: {
                    refundedAt: null,
                  },
                },
              },
            },
          },
        },
      },
    });

    return _count.bookCopies;
  }

  @ResolveField(() => Number)
  async booksReserved(@Root() user: User) {
    const { _count } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
      select: {
        _count: {
          select: {
            reservations: {
              where: {
                deletedAt: {
                  not: null,
                },
                cartItem: null,
              },
            },
          },
        },
      },
    });

    return _count.reservations;
  }

  @ResolveField(() => Number)
  async booksRequested(
    @Root() user: User,
    @Args("onlyAvailable", { defaultValue: false }) onlyAvailable: boolean,
  ) {
    const { _count } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
      select: {
        _count: {
          select: {
            requestedBooks: {
              where: {
                deletedAt: {
                  not: null,
                },
                cartItem: null,
                OR: [
                  {
                    reservations: {
                      none: {},
                    },
                  },
                  {
                    reservations: {
                      every: {
                        deletedAt: null,
                      },
                    },
                  },
                ],
                ...(onlyAvailable
                  ? {
                      book: {
                        meta: {
                          isAvailable: true,
                        },
                      },
                    }
                  : {}),
              },
            },
          },
        },
      },
    });

    return _count.requestedBooks;
  }

  @ResolveField(() => Number)
  async booksBought(@Root() user: User) {
    const { _count } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
      select: {
        _count: {
          select: {
            purchases: {
              where: {
                refundedAt: {
                  not: null,
                },
              },
            },
          },
        },
      },
    });

    return _count.purchases;
  }

  @ResolveField(() => Number)
  async booksInCart(
    @Root() user: User,
    @Args("retailLocationId") retailLocationId: string,
  ) {
    const { ownedCarts } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
      select: {
        ownedCarts: {
          where: {
            retailLocationId,
          },
          select: {
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
      },
    });

    // Can only have one cart per retail location, so we can safely check only the first one.
    return ownedCarts[0]?._count.items ?? 0;
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async removeUser(@Input() { id }: RemoveUserPayload) {
    return this.userService.removeUser(id);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async updateRole(
    @Input() { userId, retailLocationId, role }: UpdateRolePayload,
  ) {
    await this.prisma.locationMember.update({
      where: {
        userId_retailLocationId: {
          userId,
          retailLocationId,
        },
      },
      data: {
        role,
      },
    });
  }
}
