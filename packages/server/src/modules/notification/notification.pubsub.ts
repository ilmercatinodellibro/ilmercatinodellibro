import { Injectable } from "@nestjs/common";
import { Notification } from "src/@generated";
import { TypedPubSub } from "src/helpers/typed-pub-sub";

// TODO: replace with a Redis based one
// See https://github.com/davidyaha/graphql-redis-subscriptions
@Injectable()
export class NotificationPubSub extends TypedPubSub<{
  newNotification: Notification;
}> {}
