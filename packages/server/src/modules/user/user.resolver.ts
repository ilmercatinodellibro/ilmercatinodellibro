import { Mutation, Query, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { User } from "src/@generated/user";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { RemoveUserPayload, UpdateRolePayload } from "./user.args";
import { UserService } from "./user.service";

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [User])
  async users() {
    return await this.prisma.user.findMany({
      where: {
        emailVerified: true,
      },
    });
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
              },
            },
          },
        },
      },
    });

    return _count.reservations;
  }

  @ResolveField(() => Number)
  async booksRequested(@Root() user: User) {
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

  @Mutation(() => GraphQLVoid, { nullable: true })
  removeUser(
    @Input()
    { id }: RemoveUserPayload,
  ) {
    return this.userService.removeUser(id);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async updateRole(
    @Input()
    userData: UpdateRolePayload,
  ) {
    await this.userService.updateUserRole(userData);
  }
}
