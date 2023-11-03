import { Args, Query, Resolver } from "@nestjs/graphql";
import { Event, FindManyEventArgs } from "src/@generated";
import { PrismaService } from "../prisma/prisma.service";

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [Event])
  async events(@Args() args: FindManyEventArgs) {
    return await this.prisma.event.findMany(args);
  }
}
