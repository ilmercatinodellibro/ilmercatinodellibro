import { join } from "node:path";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CloseCode, WebSocket } from "graphql-ws";
import { databaseConfiguration } from "src/config/database";
import { emailConfiguration } from "src/config/email";
import { QueueConfiguration, queueConfiguration } from "src/config/queue";
import { rootConfiguration } from "src/config/root";
import { DateScalar } from "./date.scalar";
import {
  GraphQLConnectionParams,
  GraphQLContext,
  GraphQLWebSocketExtra,
} from "./modules/auth/auth.models";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth-guard";
import { BookModule } from "./modules/book/book.module";
import { BookCopyModule } from "./modules/book-copy/book-copy.module";
import { EventModule } from "./modules/event/event.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { MailModule } from "./modules/mail/mail.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { PushNotificationModule } from "./modules/push-notification/push-notification.module";
import { ReservationModule } from "./modules/reservation/reservation.module";
import { RetailLocationModule } from "./modules/retail-location/retail-location.module";
import { SaleModule } from "./modules/sale/sale.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        rootConfiguration,
        databaseConfiguration,
        emailConfiguration,
        queueConfiguration,
      ],
      expandVariables: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../..", "/client-dist"),
      exclude: [
        // /(.*) is required to allow access to the playground
        "/graphql/(.*)",
        "/subscriptions",
      ],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // See https://www.apollographql.com/docs/apollo-server/migration/#appropriate-400-status-codes
      status400ForVariableCoercionErrors: true,
      autoSchemaFile: join(process.cwd(), "src/@generated/schema.graphql"),
      sortSchema: true,
      buildSchemaOptions: {
        // Keep this in sync with ./generate.ts
      },
      subscriptions: {
        "graphql-ws": {
          path: "/subscriptions",
          // NestJS docs for GraphQL subscriptions suggest to manage user authentication into this method
          // We're actually using Passport JWT to handle that, but Passport recipe doesn't cover this bit
          // and the correct way to accomplish this isn't explained anywhere
          // Here are different sources which help understanding the general context
          // See https://docs.nestjs.com/graphql/subscriptions#authentication-over-websockets
          // See https://www.apollographql.com/docs/react/data/subscriptions/#5-authenticate-over-websocket-optional
          // See https://github.com/nestjs/docs.nestjs.com/issues/394
          onConnect: (context) => {
            // We cannot strongly type the context param, so we manually cast the properties we need
            const extra = context.extra as Omit<
              GraphQLWebSocketExtra,
              // `request` only exist during GraphQL requests, not during the initial connection
              "request"
            >;
            const { authorization } =
              context.connectionParams as unknown as GraphQLConnectionParams;

            extra.authorizationHeader = authorization;
          },
          onNext: (ctx, message) => {
            const errors = message.payload.errors ?? [];
            if (errors.some(({ message }) => message === "Unauthorized")) {
              const { socket } = ctx.extra as { socket: WebSocket };

              void socket.close(CloseCode.Forbidden, "Forbidden");
            }
          },
        },
      },
      context: (
        context: GraphQLContext & { extra?: GraphQLWebSocketExtra },
      ) => {
        const { extra } = context;

        // Not a web socket request, don't touch the context
        if (!extra) {
          return context;
        }

        extra.request.headers.authorization = extra.authorizationHeader;
        return {
          // Put the request under the `req` key to mimic the usual HTTP context
          req: extra.request,
        };
      },
    }),
    BullModule.forRootAsync({
      useFactory: ({ host, port }: QueueConfiguration) => ({
        connection: {
          host,
          port,
        },
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      }),
      inject: [queueConfiguration.KEY],
    }),
    PrismaModule,
    AuthModule,
    BookModule,
    BookCopyModule,
    MailModule,
    EventModule,
    NotificationModule,
    PushNotificationModule,
    RetailLocationModule,
    FeedbackModule,
    ReservationModule,
    SaleModule,
    UserModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }, DateScalar],
})
export class AppModule {}
