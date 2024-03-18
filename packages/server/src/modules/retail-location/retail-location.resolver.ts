import { Args, Query, Resolver } from "@nestjs/graphql";
import { RetailLocation } from "src/@generated/retail-location";
import { Public } from "../auth/decorators/public-route.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { RetailLocationQueryArgs } from "./retail-location.args";

@Resolver()
export class RetailLocationResolver {
  constructor(private readonly prisma: PrismaService) {}

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
}
