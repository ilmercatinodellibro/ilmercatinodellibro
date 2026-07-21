import { ConsoleLogger, Logger } from "@nestjs/common";
import { CommandFactory } from "nest-commander";
import { CliModule } from "src/cli.module";

async function bootstrap() {
  Logger.log("Mercatino del Libro Commands booting...", "Bootstrap");
  await CommandFactory.run(CliModule, {
    usePlugins: true,
    logger: new (class extends ConsoleLogger {
      log(message: string, context?: string) {
        if (context === "NestFactory" || context === "InstanceLoader") {
          return;
        }

        super.log(message, context);
      }
    })(),
  });
}

void bootstrap();
