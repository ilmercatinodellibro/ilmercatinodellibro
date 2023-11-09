import { UnprocessableEntityException } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { RetailLocation } from "src/@generated/retail-location";
import { Input } from "../auth/decorators/input.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { RetailLocationQueryPayload } from "./retail-location.args";

@Resolver()
export class RetailLocationResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [RetailLocation])
  async retailLocations() {
    return this.prisma.retailLocation.findMany();
  }

  @Query(() => RetailLocation)
  retailLocation(
    @Input()
    { id, humanReadableId }: RetailLocationQueryPayload,
  ) {
    if (id) {
      return this.prisma.retailLocation.findUniqueOrThrow({
        where: {
          id,
        },
      });
    }

    if (humanReadableId) {
      return this.prisma.retailLocation.findUniqueOrThrow({
        where: {
          humanReadableId,
        },
      });
    }

    throw new UnprocessableEntityException(
      "Provide a valid id or humanReadableId.",
    );
  }
}
