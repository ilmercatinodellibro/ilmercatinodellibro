import { UnprocessableEntityException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Prisma, Role, User } from "@prisma/client";
import { GraphQLVoid } from "graphql-scalars";
import { merge } from "lodash";
import { RetailLocation } from "src/@generated/retail-location";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { Input } from "src/modules/auth/decorators/input.decorator";
import { getPrismaRetailLocationFilters } from "src/modules/retail-location/retail-location.helpers";
import {
  UpdateRetailLocationInfoInput,
  UpdateRetailLocationSettingsInput,
} from "src/modules/retail-location/retail-location.input";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service";
import { UpdateRetailLocationThemeInput } from "src/modules/retail-location/theme.args";
import {
  languageLocales,
  type RetailLocationInfo,
} from "test/fixtures/retail-locations";
import { Public } from "../auth/decorators/public-route.decorator";
import { PrismaService } from "../prisma/prisma.service";
import {
  ChartElement,
  LocationBoundQueryArgs,
  ResetRetailLocationInput,
  RetailLocationQueryArgs,
  StatisticsQueryResult,
} from "./retail-location.args";

const STATISTICS_FORBIDDEN_MESSAGE =
  "You do not have permission to view retail location statistics.";

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
      message: STATISTICS_FORBIDDEN_MESSAGE,
    });

    const { retailLocationFilter, notAdminUser, activeUsersFilter } =
      getPrismaRetailLocationFilters(retailLocationId);

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

    const getTotalReservationsCount = this.prisma.reservation.count({
      where: {
        ...retailLocationFilter,
      },
    });

    const getActiveReservationsCount = this.prisma.reservation.count({
      where: {
        ...retailLocationFilter,
        saleId: {
          not: null,
        },
        deletedAt: null,
      },
    });

    const getReservationsWhichLedToASaleCount = this.prisma.reservation.count({
      where: {
        ...retailLocationFilter,
        sale: {
          refundedAt: null,
        },
      },
    });

    const getActiveRequestsCount = this.prisma.bookRequest.count({
      where: {
        ...retailLocationFilter,
        deletedAt: null,
      },
    });

    const getActiveUsersCount = this.prisma.user.count({
      where: activeUsersFilter,
    });

    const getActiveUsersPerLocaleCount = Promise.all(
      languageLocales.map(async (locale) => {
        const localeActiveUsersCount = await this.prisma.user.count({
          where: { locale, ...activeUsersFilter },
        });

        return { locale, count: localeActiveUsersCount };
      }),
    );

    const buyingCustomersFilter = {
      purchases: {
        some: {
          bookCopy: {
            ...retailLocationFilter,
          },
          purchasedBy: notAdminUser,
        },
      },
    } satisfies Prisma.UserWhereInput;

    const sellingCustomersFilter = {
      bookCopies: {
        some: {
          ...retailLocationFilter,
          sales: {
            some: {
              refundedAt: null,
            },
          },
        },
      },
      ...notAdminUser,
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
    const getUsersWithDiscountCount = this.prisma.user.count({
      where: {
        discount: true,
      },
    });
    const getRequestingUsersCount = this.prisma.user.count({
      where: {
        requestedBooks: {
          some: {
            ...retailLocationFilter,
          },
        },
        ...notAdminUser,
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
      let soldBooksOriginalPriceTotal = 0;

      const adminsActiveSales = [];
      const customersActiveSales = [];

      for (const sale of activeSales) {
        const {
          discountApplied,
          bookCopy: {
            book: { originalPrice },
            owner: { memberships },
            settledAt,
          },
        } = sale;

        const saleRevenue =
          (originalPrice * (discountApplied ? buyRate : sellRate)) / 100;
        grossRevenue += saleRevenue;
        soldBooksOriginalPriceTotal += originalPrice;

        // Save admin accounts revenue aside and avoid taking it into account while calculating settleable and settled amounts
        const isAdminSale = memberships.some(({ role }) => role === Role.ADMIN);
        if (isAdminSale) {
          adminsActiveSales.push(sale);
          adminAccountsRevenue += saleRevenue;
          continue;
        }

        customersActiveSales.push(sale);

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
        soldBooksOriginalPriceTotal,
        adminAccountsRevenue,
        activeSales,
        adminsActiveSales,
        customersActiveSales,
        sellRate,
        buyRate,
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
      totalReservationsCount,
      reservationsWhichLedToASaleCount,
      activeRequestsCount,
      activeUsersCount,
      buyingCustomersCount,
      sellingCustomersCount,
      customersCount,
      usersWithDiscountCount,
      requestingUsersCount,
      activeUsersPerLocaleCount,
      {
        settleableAmount,
        settledAmount,
        toSettleAmount,
        reimbursedAmount,
        grossRevenue,
        netRevenue,
        soldBooksOriginalPriceTotal,
        adminAccountsRevenue,
        adminsActiveSales,
        customersActiveSales,
        sellRate,
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
      getTotalReservationsCount,
      getReservationsWhichLedToASaleCount,
      getActiveRequestsCount,
      getActiveUsersCount,
      getBuyingCustomersCount,
      getSellingCustomersCount,
      getCustomersCount,
      getUsersWithDiscountCount,
      getRequestingUsersCount,
      getActiveUsersPerLocaleCount,
      getMoneyAmounts(),
    ]);

    // Values which can be derived from data previously fetched from the DB

    // Admins shouldn't ever have purchases from customers
    // Customers purchases come from both admins' and customers' owned books
    const booksPurchasedByCustomersCount =
      adminsActiveSales.length + customersActiveSales.length;
    // Customers sales only come from customers' owned books
    const booksSoldByCustomersCount = customersActiveSales.length;

    const purchasedOrSoldBooksAverage =
      activeUsersCount === 0
        ? 0
        : (booksPurchasedByCustomersCount + booksSoldByCustomersCount) /
          activeUsersCount;

    const soldBooksFromSellersAverage =
      sellingCustomersCount === 0
        ? 0
        : booksSoldByCustomersCount / sellingCustomersCount;

    const purchasedBooksFromBuyersAverage =
      buyingCustomersCount === 0
        ? 0
        : booksPurchasedByCustomersCount / buyingCustomersCount;

    const settleableMoneyAverage =
      activeUsersCount === 0 ? 0 : settleableAmount / activeUsersCount;

    const sellingCustomersIncomeAverage =
      sellingCustomersCount === 0
        ? 0
        : (grossRevenue - adminAccountsRevenue) / sellingCustomersCount;

    const buyingCustomersFullExpenseAverage =
      buyingCustomersCount === 0
        ? 0
        : soldBooksOriginalPriceTotal / buyingCustomersCount;

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
      totalReservationsCount,
      reservationsWhichLedToASaleCount,
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
      usersWithDiscountCount,
      requestingUsersCount,
      purchasedOrSoldBooksAverage,
      soldBooksFromSellersAverage,
      purchasedBooksFromBuyersAverage,
      settleableMoneyAverage,
      activeUsersPerLocaleCount,
      soldBooksOriginalPriceTotal,
      sellingCustomersIncomeAverage,
      buyingCustomersFullExpenseAverage,
      buyingCustomersDiscountedExpenseAverage,
      buyingCustomersSavingAverage,
    } satisfies StatisticsQueryResult;
  }

  @Query(() => [ChartElement])
  async deliveriesChartData(
    @Args() { retailLocationId }: LocationBoundQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ): Promise<ChartElement[]> {
    await this.authService.assertMembership({
      userId: currentUserId,
      retailLocationId,
      message: STATISTICS_FORBIDDEN_MESSAGE,
    });

    const bookCopies = await this.prisma.bookCopy.findMany({
      where: {
        book: {
          retailLocationId,
        },
      },
      select: { createdAt: true },
    });

    return this.#transformToChartData(
      bookCopies.map(({ createdAt }) => createdAt),
    );
  }

  @Query(() => [ChartElement])
  async salesChartData(
    @Args() { retailLocationId }: LocationBoundQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ): Promise<ChartElement[]> {
    await this.authService.assertMembership({
      userId: currentUserId,
      retailLocationId,
      message: STATISTICS_FORBIDDEN_MESSAGE,
    });

    const activeSales = await this.prisma.sale.findMany({
      where: {
        bookCopy: {
          book: {
            retailLocationId,
          },
        },
        refundedAt: null,
      },
      select: { purchasedAt: true },
    });

    return this.#transformToChartData(
      activeSales.map(({ purchasedAt }) => purchasedAt),
    );
  }

  @Query(() => [ChartElement])
  async settlementsChartData(
    @Args() { retailLocationId }: LocationBoundQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ): Promise<ChartElement[]> {
    await this.authService.assertMembership({
      userId: currentUserId,
      retailLocationId,
      message: STATISTICS_FORBIDDEN_MESSAGE,
    });

    const settlements = await this.prisma.bookCopy.findMany({
      where: {
        book: {
          retailLocationId,
        },
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
  async returningsChartData(
    @Args() { retailLocationId }: LocationBoundQueryArgs,
    @CurrentUser() { id: currentUserId }: User,
  ): Promise<ChartElement[]> {
    await this.authService.assertMembership({
      userId: currentUserId,
      retailLocationId,
      message: STATISTICS_FORBIDDEN_MESSAGE,
    });

    const returnings = await this.prisma.bookCopy.findMany({
      where: {
        book: {
          retailLocationId,
        },
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

  @Mutation(() => RetailLocation)
  async updateRetailLocationInfo(
    @Input()
    {
      retailLocationId,
      languageId,
      faqContent,
      whoAreWeContent,
      joinUsContent,
    }: UpdateRetailLocationInfoInput,
    @CurrentUser() currentUser: User,
  ) {
    await this.authService.assertMembership({
      userId: currentUser.id,
      role: Role.ADMIN,
      message: "You cannot update the retail locations data",
    });

    const { infoPagesContent } =
      await this.prisma.retailLocation.findUniqueOrThrow({
        where: {
          id: retailLocationId,
        },
        select: {
          infoPagesContent: true,
        },
      });

    const { [languageId]: currentLocaleInfo, ...otherLocalesInfo } =
      infoPagesContent as unknown as Record<string, RetailLocationInfo>;

    const updatedInfo = {
      faqContent: faqContent ?? currentLocaleInfo.faqContent,
      whoAreWeContent: whoAreWeContent ?? currentLocaleInfo.whoAreWeContent,
      joinUsContent: joinUsContent ?? currentLocaleInfo.joinUsContent,
    } satisfies RetailLocationInfo;

    return this.prisma.retailLocation.update({
      where: {
        id: retailLocationId,
      },
      data: {
        infoPagesContent: {
          ...(otherLocalesInfo as unknown as Record<string, object>),
          [languageId]: updatedInfo,
        },
      },
    });
  }
}
