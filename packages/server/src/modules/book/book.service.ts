import {
  WriteStream,
  createReadStream,
  createWriteStream,
  existsSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join as joinPath } from "node:path";
import { Injectable, NotFoundException } from "@nestjs/common";
import { parse, transform } from "csv";
import { PrismaService } from "../prisma/prisma.service";
import {
  IngestedCsvRow,
  IngestedStateSchoolRow,
  SchoolCsvConfiguration,
} from "./book-csv.types";

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async loadBooksIntoDb() {
    const locations = await this.prisma.retailLocation.findMany();
    if (locations.length === 0) {
      return false;
    }

    const prefixes = locations.map(({ id }) => id.substring(0, 2)); // Ensures that we have exactly the code belonging to the province of where that retail location is located
    const uppercasePrefixes = prefixes.map((prefix) =>
      prefix.toLocaleUpperCase(),
    );

    await this.#parseCsvBooksContent(uppercasePrefixes);

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

  async #parseCsvBooksContent(locationsPrefixes: string[] = ["MO", "RE"]) {
    const dataSource = joinPath(
      process.cwd(),
      "./tmp-files/ALTEMILIAROMAGNA.csv",
    );
    if (!existsSync(dataSource)) {
      throw new NotFoundException("The CSV file was not found.");
    }

    const dataDestination = joinPath(
      process.cwd(),
      "./tmp-files/books-source.csv",
    );

    rmSync(dataDestination, { force: true });

    const sourceStream = createReadStream(dataSource);
    const destinationStream = createWriteStream(dataDestination);
    const schoolsList: string[] = [];
    const locationBooks: Record<string, string[]> = {};

    for (const regionCode of locationsPrefixes) {
      locationBooks[regionCode] = [];
    }

    const csvParser = parse({
      skip_empty_lines: true,
      skipRecordsWithError: true,
      on_record: (record: IngestedCsvRow, { lines }) => {
        // Skips header parsing
        if (lines === 1) {
          return null;
        }

        const schoolCode = record[0];
        const provinceCode = schoolCode.substring(0, 2);
        if (locationsPrefixes.includes(provinceCode)) {
          if (!schoolsList.includes(schoolCode)) {
            schoolsList.push(schoolCode);
          }

          // Skip book if already present for a specific retail point
          const bookIsbn = record[6];
          if (locationBooks[provinceCode].includes(bookIsbn)) {
            return null;
          }

          locationBooks[provinceCode].push(bookIsbn);

          return record;
        }
        return null;
      },
    });

    const transformer = transform((row: IngestedCsvRow) => {
      const rowSubtitle = row[9];
      const subtitle =
        !rowSubtitle || rowSubtitle.toLowerCase() === "nd"
          ? ""
          : ` - ${rowSubtitle}`;
      return (
        [
          row[6], // Be aware that there may be some books which do not have a proper ISBN code. This is because those books are older than when the ISBN system was first introduced. Example: Divina Commedia.
          `"${row[5]}"`, // [1] - Mandatory: there are some lines that needs this on order to escape the comma inside titles
          `"${row[7]}"`, // [1]
          `"${row[8] + subtitle}"`, // [1]
          `"${row[12].replace(",", ".")}"`, // Needs the escape because the italian CSV uses commas instead of periods. And anyway the commas needs to be replaced bt periods to avoid SQL throwing an error.
          row[11],
          row[0].substring(0, 2).toLocaleLowerCase(),
        ].join(",") + "\n"
      );
    });

    // This line must be written prior to add a finish listener to the stream, otherwise the finish handler will be called twice
    await this.#writeStreamPromise(
      destinationStream,
      "isbn_code,subject,authors_full_name,title,original_price,publisher_name,retail_location_id\n",
    );

    return new Promise<void>((resolve, reject) => {
      destinationStream.addListener("finish", () => {
        sourceStream.close();
        destinationStream.close();

        writeFileSync(
          joinPath(process.cwd(), "./tmp-files/school_codes.csv"),
          schoolsList.join("\n"),
        );

        resolve();
      });

      destinationStream.addListener("error", (error) => {
        reject(error.message);
      });

      // Starts streaming process
      sourceStream.pipe(csvParser).pipe(transformer).pipe(destinationStream);
    });
  }

  #writeStreamPromise(stream: WriteStream, content: string) {
    return new Promise<void>((resolve, reject) => {
      stream.write(content, (possibleError) => {
        if (possibleError) {
          reject(possibleError.message);
        }

        resolve();
      });
    });
  }

  //======== Parse Schools CSV ========
  async loadSchoolsIntoDb(locationsPrefixes: string[] = ["MO", "RE"]) {
    const schoolCodes: Record<string, string[]> = {};
    const schoolCodesList: string[] = [];

    for (const regionCode of locationsPrefixes) {
      schoolCodes[regionCode] = [];
    }

    return this.#parseCsvSchoolsContent({
      sourceFileName: "SCUOLE_STATALI",
      removeDestination: true,

      csvParser: parse({
        skip_empty_lines: true,
        skipRecordsWithError: true,
        on_record: (record: IngestedStateSchoolRow, { lines }) => {
          // Skips header parsing
          if (lines === 1) {
            return null;
          }

          const schoolCode = record[6];
          const provinceCode = schoolCode.substring(0, 2);
          if (provinceCode && locationsPrefixes.includes(provinceCode)) {
            if (!schoolCodesList.includes(schoolCode)) {
              schoolCodesList.push(schoolCode);
            } else {
              // The school already exists, skip record
              return null;
            }

            schoolCodes[provinceCode].push();

            return record;
          }
          return null;
        },
      }),

      csvTransformer: transform((row: IngestedStateSchoolRow) => {
        return (
          // See [1]
          [
            `"${row[6]}"`,
            `"${row[7]}"`,
            `"${row[8]}"`,
            `"${row[6].substring(0, 2)}"`,
          ].join(",") + "\n"
        );
      }),
    });
  }

  async #parseCsvSchoolsContent({
    csvParser,
    sourceFileName,
    csvTransformer,
    removeDestination = false,
  }: SchoolCsvConfiguration) {
    const dataSource = joinPath(
      process.cwd(),
      `./tmp-files/${sourceFileName}.csv`,
    );
    if (!existsSync(dataSource)) {
      throw new NotFoundException(
        `The CSV file with name ${sourceFileName} was not found.`,
      );
    }

    const dataDestination = joinPath(
      process.cwd(),
      "./tmp-files/schools-meta.csv",
    );

    if (removeDestination) {
      rmSync(dataDestination, { force: true });
    }

    const sourceStream = createReadStream(dataSource);
    const destinationStream = createWriteStream(dataDestination);

    // This line must be written prior to add a finish listener to the stream, otherwise the finish handler will be called twice
    await this.#writeStreamPromise(
      destinationStream,
      // [1] - School data CSV format
      "code,name,address,province_code\n",
    );

    return new Promise<void>((resolve, reject) => {
      destinationStream.addListener("finish", () => {
        sourceStream.close();
        destinationStream.close();

        resolve();
      });

      destinationStream.addListener("error", (error) => {
        reject(error.message);
      });

      // Starts streaming process
      sourceStream.pipe(csvParser).pipe(csvTransformer).pipe(destinationStream);
    });
  }
}
