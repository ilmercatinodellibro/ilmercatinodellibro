import { repl } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const replServer = await repl(AppModule);
  replServer.setupHistory("src/@generated/.nestjs_repl_history", (error) => {
    if (error) {
      console.error(error);
    }
  });
}
void bootstrap();
