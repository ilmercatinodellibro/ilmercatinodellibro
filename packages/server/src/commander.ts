/* eslint-disable no-console */
import * as dotenv from "dotenv";
import { CommandFactory } from "nest-commander";
import { ImportBooksModule } from "./modules/book/import-books.module";

dotenv.config();

async function bootstrap() {
  console.log("Mercatino del Libro Commands booting...");
  await CommandFactory.run(ImportBooksModule, {
    usePlugins: true,
    logger: console,
  });
}

void bootstrap();
