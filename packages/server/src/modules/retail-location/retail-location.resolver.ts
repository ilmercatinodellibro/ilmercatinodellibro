import { UnprocessableEntityException } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { RetailLocation } from "src/@generated/retail-location";
import { Input } from "../auth/decorators/input.decorator";
import { Public } from "../auth/decorators/public-route.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { RetailLocationQueryPayload } from "./retail-location.args";

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
  retailLocation(@Input() { id }: RetailLocationQueryPayload) {
    if (!id) {
      throw new UnprocessableEntityException(
        "Provide a valid id or humanReadableId.",
      );
    }

    return this.prisma.retailLocation.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }
}
