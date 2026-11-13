import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";

/** Creates the app as it runs in production, main.ts and the e2e tests start it with this */
export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bodyParser: false,
  });

  // Our clients never send compressed request bodies, so reject them with a
  // 415 instead of inflating them.
  app.useBodyParser("json", { inflate: false });
  app.useBodyParser("urlencoded", { inflate: false, extended: true });

  app.enableShutdownHooks();

  return app;
}
