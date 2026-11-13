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
import { authConfiguration } from "src/config/auth.js";
import { brevoConfiguration } from "src/config/brevo.js";
import { databaseConfiguration } from "src/config/database.js";
import { emailConfiguration } from "src/config/email.js";
import { QueueConfiguration, queueConfiguration } from "src/config/queue.js";
import { rootConfiguration } from "src/config/root.js";
import { ProblemModule } from "src/modules/problem/problem.module.js";
import { ReceiptModule } from "src/modules/receipt/receipt.module.js";
import { DateScalar } from "./date.scalar.js";
import {
  GraphQLConnectionParameters,
  GraphQLContext,
  GraphQLWebSocketExtra,
} from "./modules/auth/auth.models.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth-guard.js";
import { BookModule } from "./modules/book/book.module.js";
import { BookCopyModule } from "./modules/book-copy/book-copy.module.js";
import { BookRequestModule } from "./modules/book-request/book-request.module.js";
import { CartModule } from "./modules/cart/cart.module.js";
import { EventModule } from "./modules/event/event.module.js";
import { FeedbackModule } from "./modules/feedback/feedback.module.js";
import { MailModule } from "./modules/mail/mail.module.js";
import { NotificationModule } from "./modules/notification/notification.module.js";
import { PrismaModule } from "./modules/prisma/prisma.module.js";
import { PushNotificationModule } from "./modules/push-notification/push-notification.module.js";
import { ReservationModule } from "./modules/reservation/reservation.module.js";
import { RetailLocationModule } from "./modules/retail-location/retail-location.module.js";
import { SaleModule } from "./modules/sale/sale.module.js";
import { SchoolModule } from "./modules/school/school.module.js";
import { UserModule } from "./modules/user/user.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        rootConfiguration,
        authConfiguration,
        databaseConfiguration,
        emailConfiguration,
        queueConfiguration,
        brevoConfiguration,
      ],
      expandVariables: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, "../..", "/client-dist"),
      exclude: [
        // The SPA fallback registers its route before Apollo does, so it must exclude bare /graphql too.
        // Otherwise GET requests to it, which are queries and the GraphiQL page, receive the SPA.
        "/graphql{/*subpath}",
        "/subscriptions",
      ],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
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
              context.connectionParams as unknown as GraphQLConnectionParameters;

            extra.authorizationHeader = authorization;
          },
          // eslint-disable-next-line @typescript-eslint/max-params -- the signature is imposed by graphql-ws
          onNext: (ctx, _id, _payload, _args, result) => {
            const errors = result.errors ?? [];
            if (!errors.some(({ message }) => message === "Unauthorized")) {
              return;
            }

            const { socket } = ctx.extra as { socket: WebSocket };

            void socket.close(CloseCode.Forbidden, "Forbidden");
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
    BookRequestModule,
    CartModule,
    MailModule,
    EventModule,
    NotificationModule,
    PushNotificationModule,
    RetailLocationModule,
    FeedbackModule,
    ReservationModule,
    SaleModule,
    UserModule,
    ProblemModule,
    ReceiptModule,
    SchoolModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }, DateScalar],
})
export class AppModule {}
