import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bodyParser: false,
  });

  // Our clients never send compressed request bodies, so reject them with a
  // 415 instead of inflating them.
  app.useBodyParser("json", { inflate: false });
  app.useBodyParser("urlencoded", { inflate: false, extended: true });

  app.enableShutdownHooks();

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
void bootstrap();
