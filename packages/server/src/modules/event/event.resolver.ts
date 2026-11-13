import { Query, Resolver } from "@nestjs/graphql";
import { Event } from "src/@generated/graphql/index.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [Event])
  async events() {
    return await this.prisma.event.findMany();
  }
}
