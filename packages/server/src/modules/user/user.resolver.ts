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
import * as argon2 from "argon2";
import { GraphQLVoid } from "graphql-scalars";
import { omit } from "lodash";
import { Role } from "src/@generated";
import { User } from "src/@generated/user";
import { AuthService } from "src/modules/auth/auth.service";
import { LocationBoundQueryArgs } from "src/modules/retail-location";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  RegisterUserPayload,
  RemoveMemberPayload,
  SettleRemainingType,
  SettleUserInput,
  UpdateRolePayload,
  UpdateUserPayload,
  UsersQueryArgs,
  UsersQueryResult,
} from "./user.args";
import { UserService } from "./user.service";

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
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

    await this.authService.assertMembership({
      userId: user.id,
      message: "You are not allowed to view the list of users.",
    });

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
    await this.authService.assertMembership({
      userId: user.id,
      retailLocationId,
      role: Role.ADMIN,
      message:
        "You are not allowed to view the list of members for this location.",
    });

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
                donatedAt: null,
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
                deletedAt: null,
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
              // This where statement should be very similar to the one of book-request.resolver
              where: {
                deletedAt: null,
                cartItem: null,
                AND: [
                  {
                    OR: [
                      {
                        saleId: null,
                      },
                      {
                        // All related sales must have been refunded in order to show the request
                        sale: {
                          refundedAt: {
                            not: null,
                          },
                        },
                      },
                    ],
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
                            deletedAt: {
                              not: null,
                            },
                          },
                        },
                      },
                    ],
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
                refundedAt: null,
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

  @Mutation(() => User)
  async createUser(
    @Input() payload: RegisterUserPayload,
    @CurrentUser() currentUser: User,
  ) {
    await this.authService.assertMembership({
      userId: currentUser.id,
      retailLocationId: payload.retailLocationId,
      message: "You are not allowed to create members.",
    });

    if (await this.userService.findUserByEmail(payload.email)) {
      throw new ForbiddenException("A user with this email already exists.");
    }
    if (payload.password !== payload.passwordConfirmation) {
      throw new UnprocessableEntityException(
        "Confirmation password doesn't match with provided password!",
      );
    }
    // TODO: require delegate full name when the user is a minor

    const userIsAdmin = await this.authService.userIsAdmin(
      currentUser.id,
      payload.retailLocationId,
    );
    return this.userService.createUser(
      omit(
        payload,
        userIsAdmin
          ? ["passwordConfirmation", "retailLocationId"]
          : ["passwordConfirmation", "retailLocationId", "discount"],
      ),
    );
  }

  @Mutation(() => User)
  async updateUser(
    @Input()
    {
      id: userId,
      retailLocationId,
      discount,
      password,
      passwordConfirmation,
      ...payloadRest
    }: UpdateUserPayload,
    @CurrentUser() currentUser: User,
  ) {
    if (userId !== currentUser.id) {
      await this.authService.assertMembership({
        userId: currentUser.id,
        retailLocationId,
        message: "You do not have permissions to edit user data.",
      });
    }

    await this.prisma.user.findFirstOrThrow({
      where: {
        id: userId,
      },
    });

    if (
      (!!password || !!passwordConfirmation) &&
      password !== passwordConfirmation
    ) {
      throw new UnprocessableEntityException(
        "Confirmation password doesn't match with provided password!",
      );
    }
    if (
      payloadRest.dateOfBirth &&
      new Date().getUTCFullYear() -
        new Date(payloadRest.dateOfBirth).getUTCFullYear() <
        18 &&
      (!payloadRest.delegate || payloadRest.delegate.length === 0)
    ) {
      throw new UnprocessableEntityException(
        "Trying to register a user which is a minor, but not providing an adult delegate for the user.",
      );
    }
    const userIsAdmin = await this.authService.userIsAdmin(
      currentUser.id,
      retailLocationId,
    );

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...payloadRest,
        ...(userIsAdmin ? { discount } : {}),
        ...(!!password &&
        !!passwordConfirmation &&
        password === passwordConfirmation
          ? { password: await argon2.hash(password) }
          : {}),
      },
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async removeMember(
    @Input() { id: userId, retailLocationId }: RemoveMemberPayload,
    @CurrentUser() currentUser: User,
  ) {
    await this.authService.assertMembership({
      userId: currentUser.id,
      retailLocationId,
      role: Role.ADMIN,
      message: "You are not allowed to remove members from this location.",
    });

    const anyOtherAdmin = await this.prisma.locationMember.findFirst({
      where: {
        retailLocationId,
        role: Role.ADMIN,
        userId: {
          not: userId,
        },
      },
    });
    if (!anyOtherAdmin) {
      throw new UnprocessableEntityException(
        "You cannot remove the last admin of a location.",
      );
    }

    return this.prisma.locationMember.delete({
      where: {
        userId_retailLocationId: {
          userId,
          retailLocationId,
        },
      },
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async updateRole(
    @Input() { userId, retailLocationId, role }: UpdateRolePayload,
    @CurrentUser() currentUser: User,
  ) {
    await this.authService.assertMembership({
      userId: currentUser.id,
      retailLocationId,
      role: Role.ADMIN,
      message:
        "You are not allowed to update roles of members in this location.",
    });

    if (role !== Role.ADMIN) {
      const anyOtherAdmin = await this.prisma.locationMember.findFirst({
        where: {
          retailLocationId,
          role: Role.ADMIN,
          userId: {
            not: userId,
          },
        },
      });
      if (!anyOtherAdmin) {
        throw new UnprocessableEntityException(
          "You cannot demote the last admin of a location.",
        );
      }
    }

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

  @Mutation(() => GraphQLVoid, { nullable: true })
  async settleUser(
    @Input() { userId, retailLocationId, remainingType }: SettleUserInput,
    @CurrentUser() operator: User,
  ) {
    await this.authService.assertMembership({
      userId: operator.id,
      retailLocationId,
      message: "You are not allowed to settle users.",
    });

    await this.prisma.$transaction(async (prisma) => {
      const bookCopies = await prisma.bookCopy.findMany({
        where: {
          ownerId: userId,
          settledAt: null,
          book: {
            retailLocationId,
          },
        },
        include: {
          book: true,
          sales: true,
        },
      });

      const returnableCopies = bookCopies.filter(
        ({ sales, returnedAt, donatedAt, reimbursedAt }) =>
          returnedAt === null &&
          donatedAt === null &&
          reimbursedAt === null &&
          sales.every(({ refundedAt }) => refundedAt !== null),
      );
      if (returnableCopies.length > 0) {
        await prisma.bookCopy.updateMany({
          where: {
            id: {
              in: returnableCopies.map(({ id }) => id),
            },
          },
          data: {
            ...(remainingType === SettleRemainingType.RETURN
              ? {
                  returnedAt: new Date(),
                  returnedById: operator.id,
                }
              : {
                  donatedAt: new Date(),
                  donatedById: operator.id,
                }),
          },
        });
      }

      // Settle all non-settled book copies
      await prisma.bookCopy.updateMany({
        where: {
          id: {
            in: bookCopies.map(({ id }) => id),
          },
        },
        data: {
          settledAt: new Date(),
          settledById: operator.id,
        },
      });
    });
  }
}
