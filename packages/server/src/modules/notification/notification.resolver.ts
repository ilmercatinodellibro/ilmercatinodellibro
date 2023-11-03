import { EventEmitter2 } from "@nestjs/event-emitter";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { Notification } from "src/@generated";
import { GraphQLContext } from "../auth/auth.models";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { Public } from "../auth/decorators/public-route.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { NEW_NOTIFICATION_EVENT } from "./notification.module";
import { NotificationPubSub } from "./notification.pubsub";
import { SetNotificationReadStatusInput } from "./set-notification-read-status.input";

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubSub: NotificationPubSub,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Query(() => [Notification])
  async notifications(@CurrentUser("id") userId: string) {
    return await this.prisma.notification.findMany({
      where: {
        userId,
      },
    });
  }

  @Subscription(() => Notification, {
    // We don't publish like { newNotification: { ... } }, so we resolve the whole payload
    resolve: (payload: Notification) => payload,
    filter: ({ userId }: Notification, _, { req }: GraphQLContext) =>
      userId === req.user.id,
  })
  newNotification() {
    return this.pubSub.asyncIterator("newNotification");
  }

  @Mutation(() => Notification)
  async setNotificationReadStatus(
    @Input() { id, read }: SetNotificationReadStatusInput,
  ) {
    return await this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        readAt: read ? new Date() : null,
      },
    });
  }

  // TODO: this stub is meant to be used in the GraphQL Playground (http://localhost:3000/graphql)
  // You can paste the code into the developer console to get your user id to use as the argument:
  // JSON.parse(localStorage.getItem('auth-user').split('__q_objt|')[1]).id
  // Push notifications may not get triggered as it queries the database for extra details, and userId may not match
  // But, pubsub, thus GraphQL subscriptions, should always work
  @Public()
  @Mutation(() => GraphQLVoid, { nullable: true })
  async _triggerStubNotification(@Args("userId") userId: string) {
    // Due to field resolvers and whatnot, we have to send real data
    // Normally, we would send a new notification, not an existing one
    // This takes notifications from other users and overrides the userId
    // so that we can simulate a new notification
    const notificationsCount = await this.prisma.notification.count({
      where: {
        userId: {
          not: userId,
        },
      },
    });
    const randomNotification = await this.prisma.notification.findFirstOrThrow({
      skip: Math.floor(Math.random() * notificationsCount),
      where: {
        userId: {
          not: userId,
        },
      },
    });
    this.eventEmitter.emit(NEW_NOTIFICATION_EVENT, {
      ...randomNotification,
      userId,
    });
  }
}
