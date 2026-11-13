import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
  Subscription,
} from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { Event, Notification } from "src/@generated/graphql/index.js";
import { NewNotificationPayload } from "src/modules/notification/send-push-notification.listener.js";
import { GraphQLContext } from "../auth/auth.models.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Input } from "../auth/decorators/input.decorator.js";
import { Public } from "../auth/decorators/public-route.decorator.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { NEW_NOTIFICATION_EVENT } from "./notification.events.js";
import { NotificationPubSub } from "./notification.pubsub.js";
import { SetNotificationReadStatusInput } from "./set-notification-read-status.input.js";

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
    filter: ({ userId }: Notification, _, { req: request }: GraphQLContext) =>
      userId === request.user.id,
  })
  newNotification() {
    return this.pubSub.asyncIterableIterator("newNotification");
  }

  @ResolveField(() => Event)
  async event(@Root() notification: Notification) {
    return this.prisma.event.findUniqueOrThrow({
      where: {
        id: notification.eventId,
      },
    });
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
    const { event, ...randomNotification } =
      await this.prisma.notification.findFirstOrThrow({
        skip: Math.floor(Math.random() * notificationsCount),
        where: {
          userId: {
            not: userId,
          },
        },
        include: {
          event: true,
        },
      });
    this.eventEmitter.emit(NEW_NOTIFICATION_EVENT, {
      event,
      notification: {
        ...randomNotification,
        userId,
      },
    } satisfies NewNotificationPayload);
  }
}
