import { BadRequestException } from "@nestjs/common";
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
    return this.prisma.retailLocation.findMany();
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
      Object.values({
        maxBookingDays,
        warehouseMaxBlockSize,
        buyRate,
        sellRate,
      }).some((value) => !value || value < 0)
    ) {
      throw new BadRequestException("Invalid settings values");
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

  private readonly notSoldOrRefunded: Prisma.BookCopyWhereInput[] = [
    {
      // Sold but refunded (if at least one of the sales has a null "refundedAt")
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
  ];

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

    const getTotalBooksWithProblems = this.prisma.bookCopy.count({
      where: {
        book: {
          retailLocationId,
        },
        problems: {
          some: {
            resolvedAt: null,
          },
        },
        returnedAt: {
          not: null,
        },
      },
    });

    const getTotalPresentBooks = this.prisma.bookCopy.count({
      where: {
        book: {
          retailLocationId,
        },
        returnedAt: null,
        AND: [
          {
            OR: this.noProblemsFilter,
          },
          {
            OR: this.notSoldOrRefunded,
          },
        ],
      },
    });

    const getTotalSoldBooks = this.prisma.sale.count({
      where: {
        refundedAt: null,
        bookCopy: {
          book: {
            retailLocationId,
          },
        },
      },
    });

    const getTotalReservedBooks = this.prisma.reservation.count({
      where: {
        book: {
          retailLocationId,
        },
        deletedAt: null,
      },
    });

    const getTotalRequestedBooks = this.prisma.bookRequest.count({
      where: {
        book: {
          retailLocationId,
        },
        deletedAt: null,
      },
    });

    const getTotalUsers = this.prisma.user.count({
      where: {
        OR: [
          {
            requestedBooks: {
              some: {
                book: {
                  retailLocationId,
                },
                deletedAt: null,
              },
            },
          },
          {
            bookCopies: {
              some: {
                book: {
                  retailLocationId,
                },
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
          book: {
            retailLocationId,
          },
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
          },
        },
      },
    });

    const getTotals = async () => {
      const [activeSales, { sellRate, buyRate }] = await Promise.all([
        getActiveSales,
        this.retailLocation({
          id: retailLocationId,
        }),
      ]);

      let totalRevenue = 0;
      let settledTotal = 0;
      let settleableTotal = 0;

      activeSales.forEach(
        ({
          iseeDiscountApplied,
          bookCopy: {
            book: { originalPrice },
            settledAt,
          },
        }) => {
          totalRevenue +=
            (originalPrice * (iseeDiscountApplied ? buyRate : sellRate)) / 100;

          if (settledAt === null) {
            settleableTotal += (originalPrice * buyRate) / 100;
          } else {
            settledTotal += (originalPrice * buyRate) / 100;
          }
        },
      );

      return { totalRevenue, settledTotal, settleableTotal };
    };

    const [
      totalBooksWithProblems,
      totalPresentBooks,
      totalSoldBooks,
      totalReservedBooks,
      totalRequestedBooks,
      totalUsers,
      { settleableTotal, settledTotal, totalRevenue },
    ] = await Promise.all([
      getTotalBooksWithProblems,
      getTotalPresentBooks,
      getTotalSoldBooks,
      getTotalReservedBooks,
      getTotalRequestedBooks,
      getTotalUsers,
      getTotals(),
    ]);

    return {
      totalBooksWithProblems,
      totalPresentBooks,
      totalSoldBooks,
      totalReservedBooks,
      totalRequestedBooks,
      totalUsers,
      settleableTotal,
      settledTotal,
      totalRevenue,
    };
  }
}
