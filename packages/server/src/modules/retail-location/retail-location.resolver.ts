import { UnprocessableEntityException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Prisma, Role, User } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { merge, sumBy } from "lodash";
import { RetailLocation } from "src/@generated/retail-location";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { Input } from "src/modules/auth/decorators/input.decorator";
import { UpdateRetailLocationSettingsInput } from "src/modules/retail-location/retail-location.input";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service";
import { UpdateRetailLocationThemeInput } from "src/modules/retail-location/theme.args";
import { languageLocales } from "test/fixtures/retail-locations";
import { Public } from "../auth/decorators/public-route.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  ChartElement,
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

    const [activeSales, reimbursedBooks, { sellRate, buyRate }] =
      await Promise.all([
        getActiveSales,
        getReimbursedBooks,
        this.retailLocation({
          id: retailLocationId,
        }),
      ]);

    const getMoneyAmounts = () => {
      let grossRevenue = 0;
      let adminAccountsRevenue = 0;
      let settleableAmount = 0;
      let settledAmount = 0;
      let toSettleAmount = 0;
      let quotaMoneyTotal = 0;

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

        if (iseeDiscountApplied) {
          quotaMoneyTotal += (originalPrice * sellRate) / 100;
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
        quotaMoneyTotal,
      };
    };

    const buyingCustomersFilter = {
      purchases: {
        some: {},
      },
    } satisfies Prisma.UserWhereInput;
    const sellingCustomersFilter = {
      bookCopies: {
        some: {
          sales: {
            some: {
              refundedAt: null,
            },
          },
        },
      },
    } satisfies Prisma.UserWhereInput;

    const getBuyingCustomersCount = this.prisma.user.count({
      where: buyingCustomersFilter,
    });
    const getSellingCustomersCount = this.prisma.user.count({
      where: sellingCustomersFilter,
    });
    const getCustomersCount = this.prisma.user.count({
      where: {
        OR: [sellingCustomersFilter, buyingCustomersFilter],
      },
    });
    const getISEEUsersCount = this.prisma.user.count({
      where: {
        discount: true,
      },
    });
    const getRequestingUsersCount = this.prisma.user.count({
      where: {
        requestedBooks: {
          some: {},
        },
      },
    });

    const getPurchasedOrSoldBooksAverage = getActiveUsersCount.then(
      (customers) => activeSales.length / customers,
    );

    const getSoldBooksFromSellersAverage = getSellingCustomersCount.then(
      (sellers) => activeSales.length / sellers,
    );
    const getPurchasedBooksFromBuyersAverage = getBuyingCustomersCount.then(
      (buyers) => activeSales.length / buyers,
    );
    const getSettleableMoneyAverage = getActiveUsersCount.then(
      (customers) => getMoneyAmounts().settleableAmount / customers,
    );

    const getUsersPerLanguage = Promise.all(
      languageLocales.map((locale) =>
        this.prisma.user.count({ where: { locale } }).then((count) => ({
          locale,
          count,
        })),
      ),
    );

    const getSoldBooksOriginalPriceTotal = this.prisma.bookCopy
      .findMany({
        select: { book: { select: { originalPrice: true } } },
        where: { sales: { some: { refundedAt: null } } },
      })
      .then((copies) =>
        sumBy(copies, ({ book: { originalPrice } }) => originalPrice),
      );

    const getSellingCustomersIncomeAverage = this.prisma.sale
      .findMany({
        where: {
          refundedAt: null,
        },
        select: {
          bookCopy: {
            select: { book: { select: { originalPrice: true } } },
          },
          iseeDiscountApplied: true,
        },
      })
      .then((sales) =>
        getSellingCustomersCount.then(
          (sellersCount) =>
            sumBy(
              sales,
              ({
                bookCopy: {
                  book: { originalPrice },
                },
                iseeDiscountApplied,
              }) =>
                (originalPrice * (iseeDiscountApplied ? sellRate : buyRate)) /
                100,
            ) / sellersCount,
        ),
      );

    const getBuyingCustomersFullExpenseAverage = this.prisma.sale
      .findMany({
        where: { purchasedBy: buyingCustomersFilter },
        select: {
          bookCopy: { select: { book: { select: { originalPrice: true } } } },
        },
      })
      .then((sales) =>
        sumBy(
          sales,
          ({
            bookCopy: {
              book: { originalPrice },
            },
          }) => originalPrice,
        ),
      );

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
        quotaMoneyTotal,
      },
      buyingCustomersCount,
      sellingCustomersCount,
      customersCount,
      iseeUsersCount,
      requestingUsersCount,
      purchasedOrSoldBooksAverage,
      soldBooksFromSellersAverage,
      purchasedBooksFromBuyersAverage,
      settleableMoneyAverage,
      usersPerLanguage,
      soldBooksOriginalPriceTotal,
      sellingCustomersIncomeAverage,
      buyingCustomersFullExpenseAverage,
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
      getBuyingCustomersCount,
      getSellingCustomersCount,
      getCustomersCount,
      getISEEUsersCount,
      getRequestingUsersCount,
      getPurchasedOrSoldBooksAverage,
      getSoldBooksFromSellersAverage,
      getPurchasedBooksFromBuyersAverage,
      getSettleableMoneyAverage,
      getUsersPerLanguage,
      getSoldBooksOriginalPriceTotal,
      getSellingCustomersIncomeAverage,
      getBuyingCustomersFullExpenseAverage,
    ]);

    // Not making new db queries for the discounted and saving averages as both are derived results
    const buyingCustomersDiscountedExpenseAverage =
      (buyingCustomersFullExpenseAverage * sellRate) / 100;
    const buyingCustomersSavingAverage =
      ((100 - sellRate) * buyingCustomersFullExpenseAverage) / 100;

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
      buyingCustomersCount,
      sellingCustomersCount,
      customersCount,
      iseeUsersCount,
      requestingUsersCount,
      purchasedOrSoldBooksAverage,
      soldBooksFromSellersAverage,
      purchasedBooksFromBuyersAverage,
      settleableMoneyAverage,
      usersPerLanguage,
      quotaMoneyTotal,
      soldBooksOriginalPriceTotal,
      sellingCustomersIncomeAverage,
      buyingCustomersFullExpenseAverage,
      buyingCustomersDiscountedExpenseAverage,
      buyingCustomersSavingAverage,
    } satisfies StatisticsQueryResult;
  }

  @Query(() => [ChartElement])
  async deliveriesChartData(): Promise<ChartElement[]> {
    const bookCopies = await this.prisma.bookCopy.findMany({
      select: { createdAt: true },
    });

    return this.#transformToChartData(
      bookCopies.map(({ createdAt }) => createdAt),
    );
  }

  @Query(() => [ChartElement])
  async salesChartData(): Promise<ChartElement[]> {
    const activeSales = await this.prisma.sale.findMany({
      where: { refundedAt: null },
      select: { purchasedAt: true },
    });

    return this.#transformToChartData(
      activeSales.map(({ purchasedAt }) => purchasedAt),
    );
  }

  @Query(() => [ChartElement])
  async settlementsChartData(): Promise<ChartElement[]> {
    const settlements = await this.prisma.bookCopy.findMany({
      where: {
        settledAt: {
          not: null,
        },
      },
      select: {
        settledAt: true,
      },
    });

    return this.#transformToChartData(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      settlements.map(({ settledAt }) => settledAt!),
    );
  }

  @Query(() => [ChartElement])
  async returningsChartData(): Promise<ChartElement[]> {
    const returnings = await this.prisma.bookCopy.findMany({
      where: {
        returnedAt: {
          not: null,
        },
      },
      select: {
        returnedAt: true,
      },
    });
    return this.#transformToChartData(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      returnings.map(({ returnedAt }) => returnedAt!),
    );
  }

  #transformToChartData(data: Date[]) {
    const transformedData: ChartElement[] = [];

    for (const element of data) {
      const elementDayAtMidnight = new Date(element.setHours(0, 0, 0, 0));
      const dayIndex = transformedData.findIndex(
        ({ timestamp }) =>
          timestamp.valueOf() === elementDayAtMidnight.valueOf(),
      );
      if (dayIndex === -1) {
        transformedData.push({
          amount: 1,
          timestamp: elementDayAtMidnight,
        });
      } else {
        transformedData[dayIndex].amount++;
      }
    }

    return transformedData.sort(
      ({ timestamp: timestampA }, { timestamp: timestampB }) =>
        timestampA.valueOf() - timestampB.valueOf(),
    );
  }
}
