import { createApp } from "./create-app.js";

async function bootstrap() {
  const app = await createApp();

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
await bootstrap();
