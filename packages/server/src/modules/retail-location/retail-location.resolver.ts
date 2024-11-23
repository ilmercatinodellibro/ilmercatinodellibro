import { UnprocessableEntityException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Prisma, Role, User } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { merge } from "lodash";
import { RetailLocation } from "src/@generated/retail-location";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { Input } from "src/modules/auth/decorators/input.decorator";
import { UpdateRetailLocationSettingsInput } from "src/modules/retail-location/retail-location.input";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service";
import { UpdateRetailLocationThemeInput } from "src/modules/retail-location/theme.args";
import { Public } from "../auth/decorators/public-route.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  LocationBoundQueryArgs,
  ResetRetailLocationInput,
  RetailLocationQueryArgs,
  StatisticsQueryResult,
} from "./retail-location.args";

@Resolver()
export class RetailLocationResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly locationService: RetailLocationService,
  ) {}

  @Public()
  @Query(() => [RetailLocation])
  async retailLocations() {
    return this.prisma.retailLocation.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  @Public()
  @Query(() => RetailLocation)
  async retailLocation(@Args() { id }: RetailLocationQueryArgs) {
    return this.prisma.retailLocation.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  @Mutation(() => RetailLocation)
  async updateRetailLocationTheme(
    @Input() { retailLocationId, theme }: UpdateRetailLocationThemeInput,
    @CurrentUser() user: User,
  ) {
    await this.authService.assertMembership({
      userId: user.id,
      retailLocationId,
      role: Role.ADMIN,
    });

    const { theme: _existingTheme } =
      await this.prisma.retailLocation.findUniqueOrThrow({
        where: {
          id: retailLocationId,
        },
        select: {
          theme: true,
        },
      });
    const existingTheme = _existingTheme as Prisma.JsonObject;

    return await this.prisma.retailLocation.update({
      where: {
        id: retailLocationId,
      },
      data: {
        theme: {
          logo: theme.resetLogo ? undefined : existingTheme.logo,
          colors: theme.colors
            ? merge(existingTheme.colors, theme.colors)
            : existingTheme.colors,
        },
      },
    });
  }

  @Mutation(() => RetailLocation)
  async updateRetailLocationSettings(
    @Input()
    {
      maxBookingDays,
      registrationEnabled,
      payOffEnabled,
      retailLocationId,
      warehouseMaxBlockSize,
      buyRate,
      sellRate,
    }: UpdateRetailLocationSettingsInput,
    @CurrentUser() user: User,
  ) {
    await this.authService.assertMembership({
      userId: user.id,
      retailLocationId,
      role: Role.ADMIN,
    });

    if (
      buyRate > 100 ||
      sellRate > 100 ||
      buyRate <= 0 ||
      sellRate <= 0 ||
      buyRate > sellRate
    ) {
      throw new UnprocessableEntityException("Invalid buy/sell rates");
    }

    if (warehouseMaxBlockSize < 0 || maxBookingDays < 0) {
      throw new UnprocessableEntityException(
        "Invalid values for warehouseMaxBlockSize or maxBookingDays",
      );
    }

    // Cleanup reservations and request queues when reservations are disabled
    if (maxBookingDays === 0) {
      await this.prisma.requestQueue.deleteMany({
        where: {
          book: {
            retailLocationId,
          },
        },
      });

      await this.prisma.reservation.deleteMany({
        where: {
          book: {
            retailLocationId,
          },
        },
      });
    }

    return await this.prisma.retailLocation.update({
      where: {
        id: retailLocationId,
      },
      data: {
        maxBookingDays,
        warehouseMaxBlockSize,
        registrationEnabled,
        payOffEnabled,
        buyRate,
        sellRate,
      },
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async resetRetailLocation(
    @Input() { retailLocationId }: ResetRetailLocationInput,
    @CurrentUser() user: User,
  ) {
    await this.authService.assertMembership({
      userId: user.id,
      retailLocationId,
      role: Role.ADMIN,
    });

    await this.locationService.backupLocation(retailLocationId);
    await this.locationService.cleanupLocation(retailLocationId);
  }

  private readonly notSoldFilter: Prisma.BookCopyWhereInput[] = [
    {
      // Sold, even multiple times, but always ended up with a refund
      sales: {
        every: {
          refundedAt: {
            not: null,
          },
        },
      },
    },
    // Not sold
    {
      sales: {
        none: {},
      },
    },
  ];

  private readonly noProblemsFilter: Prisma.BookCopyWhereInput[] = [
    // No problems whatsoever (what a lucky guy)
    {
      problems: {
        none: {},
      },
    },
    // Had problems, but all of them are now resolved (slightly less lucky guy)
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

  private readonly presentInWarehouseFilter: Prisma.BookCopyWhereInput = {
    returnedAt: null,
  };

  @Query(() => StatisticsQueryResult)
  async retailLocationStatistics(
    @Args() { retailLocationId }: LocationBoundQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ) {
    await this.authService.assertMembership({
      userId: currentUserId,
      retailLocationId,
      message: "You do not have permission to view these reservations.",
    });

    const retailLocationFilter = {
      book: {
        retailLocationId,
      },
    };

    const getBooksCopiesCount = this.prisma.bookCopy.count({
      where: retailLocationFilter,
    });

    const getBooksInWarehouseCount = this.prisma.bookCopy.count({
      where: {
        ...retailLocationFilter,
        ...this.presentInWarehouseFilter,
        AND: [
          {
            OR: this.notSoldFilter,
          },
        ],
      },
    });

    const getBooksWithProblemsCount = this.prisma.bookCopy.count({
      where: {
        ...retailLocationFilter,
        ...this.presentInWarehouseFilter,
        problems: {
          some: {
            resolvedAt: null,
          },
        },
      },
    });

    const getBooksWithProblemsInWarehouseCount = this.prisma.bookCopy.count({
      where: {
        ...retailLocationFilter,
        ...this.presentInWarehouseFilter,
        problems: {
          some: {
            resolvedAt: null,
          },
        },
        AND: [
          {
            OR: this.notSoldFilter,
          },
        ],
      },
    });

    const getSalableBooksCount = this.prisma.bookCopy.count({
      where: {
        ...retailLocationFilter,
        ...this.presentInWarehouseFilter,
        AND: [
          {
            OR: this.noProblemsFilter,
          },
          {
            OR: this.notSoldFilter,
          },
        ],
      },
    });

    const getReturnedBooksCount = this.prisma.bookCopy.count({
      where: {
        ...retailLocationFilter,
        returnedAt: {
          not: null,
        },
      },
    });

    const getDonatedBooksCount = this.prisma.bookCopy.count({
      where: {
        ...retailLocationFilter,
        donatedAt: {
          not: null,
        },
      },
    });

    const getReimbursedBooksCount = this.prisma.bookCopy.count({
      where: {
        ...retailLocationFilter,
        reimbursedAt: {
          not: null,
        },
      },
    });

    const getSalesCount = this.prisma.sale.count({
      where: {
        bookCopy: {
          ...retailLocationFilter,
        },
      },
    });

    const getActiveSalesCount = this.prisma.sale.count({
      where: {
        refundedAt: null,
        bookCopy: {
          ...retailLocationFilter,
        },
      },
    });

    const getRefundedSalesCount = this.prisma.sale.count({
      where: {
        refundedAt: {
          not: null,
        },
        bookCopy: {
          ...retailLocationFilter,
        },
      },
    });

    const getActiveReservationsCount = this.prisma.reservation.count({
      where: {
        ...retailLocationFilter,
        deletedAt: null,
      },
    });

    const getActiveRequestsCount = this.prisma.bookRequest.count({
      where: {
        ...retailLocationFilter,
        deletedAt: null,
      },
    });

    const getActiveUsersCount = this.prisma.user.count({
      where: {
        OR: [
          // Requested at least one book
          {
            requestedBooks: {
              some: {
                ...retailLocationFilter,
                deletedAt: null,
              },
            },
          },
          // Gave in at least one book
          {
            bookCopies: {
              some: {
                ...retailLocationFilter,
              },
            },
          },
        ],
      },
    });

    const getActiveSales = this.prisma.sale.findMany({
      where: {
        refundedAt: null,
        bookCopy: {
          ...retailLocationFilter,
        },
      },
      include: {
        bookCopy: {
          select: {
            settledAt: true,
            book: {
              select: {
                originalPrice: true,
              },
            },
            owner: {
              select: {
                memberships: {
                  where: {
                    retailLocationId,
                  },
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const getReimbursedBooks = this.prisma.bookCopy.findMany({
      where: {
        ...retailLocationFilter,
        reimbursedAt: {
          not: null,
        },
      },
      select: {
        book: {
          select: {
            originalPrice: true,
          },
        },
      },
    });

    const getMoneyAmounts = async () => {
      const [activeSales, reimbursedBooks, { sellRate, buyRate }] =
        await Promise.all([
          getActiveSales,
          getReimbursedBooks,
          this.retailLocation({
            id: retailLocationId,
          }),
        ]);

      let grossRevenue = 0;
      let adminAccountsRevenue = 0;
      let settleableAmount = 0;
      let settledAmount = 0;
      let toSettleAmount = 0;

      for (const sale of activeSales) {
        const {
          iseeDiscountApplied,
          bookCopy: {
            book: { originalPrice },
            owner: { memberships },
            settledAt,
          },
        } = sale;

        const saleRevenue =
          (originalPrice * (iseeDiscountApplied ? buyRate : sellRate)) / 100;
        grossRevenue += saleRevenue;

        // Save admin accounts revenue aside and avoid taking it into account while calculating settleable and settled amounts
        const isAdminSale = memberships.some(({ role }) => role === Role.ADMIN);
        if (isAdminSale) {
          adminAccountsRevenue += saleRevenue;
          continue;
        }

        const buyPrice = (originalPrice * buyRate) / 100;

        settleableAmount += buyPrice;

        if (settledAt === null) {
          toSettleAmount += buyPrice;
        } else {
          settledAmount += buyPrice;
        }
      }

      let reimbursedAmount = 0;

      for (const reimbursedBook of reimbursedBooks) {
        const {
          book: { originalPrice },
        } = reimbursedBook;

        const buyPrice = (originalPrice * buyRate) / 100;

        reimbursedAmount += buyPrice;
      }

      const netRevenue = grossRevenue - settledAmount - reimbursedAmount;

      return {
        settleableAmount,
        settledAmount,
        toSettleAmount,
        reimbursedAmount,
        grossRevenue,
        netRevenue,
        adminAccountsRevenue,
      };
    };

    const [
      bookCopiesCount,
      booksInWarehouseCount,
      booksWithProblemsCount,
      booksWithProblemsInWarehouseCount,
      salableBooksCount,
      returnedBooksCount,
      donatedBooksCount,
      reimbursedBooksCount,
      salesCount,
      activeSalesCount,
      refundedSalesCount,
      activeReservationsCount,
      activeRequestsCount,
      activeUsersCount,
      {
        settleableAmount,
        settledAmount,
        toSettleAmount,
        reimbursedAmount,
        adminAccountsRevenue,
        grossRevenue,
        netRevenue,
      },
    ] = await Promise.all([
      getBooksCopiesCount,
      getBooksInWarehouseCount,
      getBooksWithProblemsCount,
      getBooksWithProblemsInWarehouseCount,
      getSalableBooksCount,
      getReturnedBooksCount,
      getDonatedBooksCount,
      getReimbursedBooksCount,
      getSalesCount,
      getActiveSalesCount,
      getRefundedSalesCount,
      getActiveReservationsCount,
      getActiveRequestsCount,
      getActiveUsersCount,
      getMoneyAmounts(),
    ]);

    return {
      bookCopiesCount,
      booksInWarehouseCount,
      booksWithProblemsCount,
      booksWithProblemsInWarehouseCount,
      salableBooksCount,
      returnedBooksCount,
      donatedBooksCount,
      reimbursedBooksCount,
      salesCount,
      activeSalesCount,
      refundedSalesCount,
      activeReservationsCount,
      activeRequestsCount,
      activeUsersCount,
      settleableAmount,
      settledAmount,
      toSettleAmount,
      reimbursedAmount,
      adminAccountsRevenue,
      grossRevenue,
      netRevenue,
    };
  }
}
