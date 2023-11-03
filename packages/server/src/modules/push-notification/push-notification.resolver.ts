import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Input } from "../auth/decorators/input.decorator";
import { Public } from "../auth/decorators/public-route.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { PushNotificationService } from "./push-notification-service.abstract";
import { PushSubscriptionInput } from "./push-subscription.input";

@Resolver()
export class PushNotificationResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushService: PushNotificationService,
  ) {}

  @Mutation(() => GraphQLVoid, { nullable: true })
  async subscribeToPushNotifications(
    @CurrentUser("id") userId: string,
    @Input() { deviceToken }: PushSubscriptionInput,
  ) {
    // We are using upsert to avoid failing if the subscription already exists
    await this.prisma.pushSubscription.upsert({
      where: {
        userId_deviceToken: {
          userId,
          deviceToken,
        },
      },
      create: {
        userId,
        deviceToken,
      },
      update: {},
    });
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async unsubscribeFromPushNotifications(
    @CurrentUser("id") userId: string,
    @Input() { deviceToken }: PushSubscriptionInput,
  ) {
    // We are using deleteMany to avoid failing if the subscription does not exist
    await this.prisma.pushSubscription.deleteMany({
      where: {
        userId,
        deviceToken,
      },
    });
  }

  // TODO: this stub is meant to be used in the GraphQL Playground (http://localhost:3000/graphql)
  // remove it in production environments
  // If using the firebase driver, keep in mind that the notification will not be displayed if the app is in the foreground
  @Public()
  @Mutation(() => GraphQLVoid, { nullable: true })
  async _triggerStubPushNotification(
    // You can paste the code into the developer console to get your user id to use as the argument:
    // JSON.parse(localStorage.getItem('auth-user').split('__q_objt|')[1]).id
    @Args("userId") userId: string,
    @Args("title") title: string,
    @Args("body") body: string,
  ) {
    await this.pushService.sendToUsers(
      {
        title,
        body,
      },
      [userId],
    );
  }
}
