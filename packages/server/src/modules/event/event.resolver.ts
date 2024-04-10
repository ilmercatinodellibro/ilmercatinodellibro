import { Query, Resolver } from "@nestjs/graphql";
import { Event } from "src/@generated";
import { PrismaService } from "../prisma/prisma.service";

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [Event])
  async events() {
    return await this.prisma.event.findMany();
  }
}
