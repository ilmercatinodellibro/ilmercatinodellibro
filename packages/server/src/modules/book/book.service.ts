import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async loadBooksIntoDb() {
    // This does  work only if the file is located within the same filesystem of the Docker image.
    // Because when DB is inside a docker instance, it cannot access external files.
    // Thus, in order to run this command on Docker DBs, you need to setup the proper key in the env file which is used inside the docker-compose.yml
    try {
      await this.prisma.$executeRaw`
      COPY "Book" (isbn_code, subject, authors_full_name, title, original_price, publisher_name, retail_location_id)
      FROM '/tmp/tmp-files/books-source.csv'
      WITH (FORMAT CSV, DELIMITER(','), HEADER MATCH);
      `;
      return true;
    } catch {
      return false;
    }
  }
}
