import { BadRequestException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Prisma, User } from "@prisma/client";
import { merge } from "lodash";
import { RetailLocation } from "src/@generated/retail-location";
import { AuthService } from "src/modules/auth/auth.service";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { Input } from "src/modules/auth/decorators/input.decorator";
import { UpdateRetailLocationSettingsInput } from "src/modules/retail-location/retail-location.input";
import { UpdateRetailLocationThemeInput } from "src/modules/retail-location/theme.args";
import { Public } from "../auth/decorators/public-route.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { RetailLocationQueryArgs } from "./retail-location.args";

@Resolver()
export class RetailLocationResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
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
      role: "ADMIN",
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
      role: "ADMIN",
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
        payOffEnabled,
        buyRate,
        sellRate,
      },
    });
  }
}
