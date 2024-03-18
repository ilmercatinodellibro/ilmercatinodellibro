import {
  WriteStream,
  createReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join as joinPath } from "node:path";
import { Injectable, NotFoundException } from "@nestjs/common";
import { parse, transform } from "csv";
import { School } from "src/@generated";
import { PrismaService } from "../prisma/prisma.service";
import {
  IngestedCsvRow,
  IngestedEquivalentSchoolRow,
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
    const locationBooks: Record<string, string[]> = {};
    const schoolCoursesMap = new Map<
      string,
      {
        year: string;
        section: string;
        booksIsbn: string[];
      }[]
    >();

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
          if (!schoolCoursesMap.has(schoolCode)) {
            schoolCoursesMap.set(schoolCode, []);
          }

          const bookIsbn = record[6];

          // Maps courses and books to their respective schools
          const schoolCourses = schoolCoursesMap.get(schoolCode) ?? [];
          const courseYear = record[1];
          const courseSection = record[2];
          const course = schoolCourses.find(
            ({ year, section }) =>
              year === courseYear && section === courseSection,
          );
          if (!course) {
            schoolCourses.push({
              section: courseSection,
              year: courseYear,
              booksIsbn: [bookIsbn],
            });
          } else if (!course.booksIsbn.includes(bookIsbn)) {
            course.booksIsbn.push(bookIsbn);
          }
          schoolCoursesMap.set(schoolCode, schoolCourses);

          // Skip book if already present for a specific retail point
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
          Array.from(schoolCoursesMap.keys()).join("\n"),
        );

        writeFileSync(
          joinPath(process.cwd(), "./tmp-files/school_courses.json"),
          JSON.stringify(Object.fromEntries(schoolCoursesMap)),
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
    const schoolCodesFromBooksCsv = readFileSync(
      joinPath(process.cwd(), "./tmp-files/school_codes.csv"),
    )
      .toString("utf-8")
      .split("\n");

    for (const regionCode of locationsPrefixes) {
      schoolCodes[regionCode] = [];
    }

    const schoolsToInsert: School[] = [];

    await this.#parseCsvSchoolsContent({
      sourceFileName: "SCUOLE_STATALI",
      destinationFileName: "filtered_state_schools",
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
          if (
            provinceCode &&
            locationsPrefixes.includes(provinceCode) &&
            schoolCodesFromBooksCsv.includes(schoolCode) &&
            !schoolCodesList.includes(schoolCode)
          ) {
            schoolCodesList.push(schoolCode);
            schoolCodes[provinceCode].push();
            return record;
          }
          return null;
        },
      }),

      csvTransformer: transform((row: IngestedStateSchoolRow) => {
        // [2]
        schoolsToInsert.push({
          code: row[6],
          name: row[7],
          address: row[8],
          provinceCode: row[6].substring(0, 2),
        });
        return (
          // See [1]
          [
            `${row[6]}`,
            `${row[7]}`,
            `${row[8]}`,
            `${row[6].substring(0, 2)}`,
          ].join(",") + "\n"
        );
      }),
    });

    await this.#parseCsvSchoolsContent({
      sourceFileName: "SCUOLE_PARITARIE",
      destinationFileName: "filtered_peer_schools",

      csvParser: parse({
        skip_empty_lines: true,
        skipRecordsWithError: true,
        on_record: (record: IngestedEquivalentSchoolRow, { lines }) => {
          // Skips header parsing
          if (lines === 1) {
            return null;
          }

          const schoolCode = record[4];
          const provinceCode = schoolCode.substring(0, 2);
          if (
            provinceCode &&
            locationsPrefixes.includes(provinceCode) &&
            schoolCodesFromBooksCsv.includes(schoolCode) &&
            !schoolCodesList.includes(schoolCode)
          ) {
            schoolCodesList.push(schoolCode);
            schoolCodes[provinceCode].push();
            return record;
          }
          return null;
        },
      }),

      csvTransformer: transform((row: IngestedEquivalentSchoolRow) => {
        // [2]
        schoolsToInsert.push({
          code: row[4],
          name: row[5],
          address: row[6],
          provinceCode: row[4].substring(0, 2),
        });
        return (
          // See [1]
          [
            `${row[4]}`,
            `${row[5]}`,
            `${row[6]}`,
            `${row[4].substring(0, 2)}`,
          ].join(",") + "\n"
        );
      }),
    });

    try {
      // [2]
      // This should have been the correct way to import the rows into the DB inside the schools table.
      // However when following this approach there are a bunch of schools (and always the same ones) that are not imported by the DB copy instruction
      // The db throws no error, and even the analysis of the records does not give any meaningful result on why those records are ignored.
      // Furthermore, if said records are left on their own inside the generated CSV file and there are just a few records, then the copy instruction can import it
      // Additionally, it should not be a problem of how many records are there inside the CSV, because the books CSV has many more records and they are imported correctly.
      // In the end and to save time, school insert into DB has been made using Prisma method.
      // await this.prisma.$executeRaw`
      // COPY "School" (code, name, address, province_code)
      // FROM '/tmp/tmp-files/filtered_state_schools.csv'
      // WITH (FORMAT CSV, DELIMITER(','), HEADER MATCH);
      // `;
      // await this.prisma.$executeRaw`
      // COPY "School" (code, name, address,  province_code)
      // FROM '/tmp/tmp-files/filtered_peer_schools.csv'
      // WITH (FORMAT CSV, DELIMITER(','), HEADER MATCH);
      // `;

      await this.prisma.school.createMany({
        data: schoolsToInsert,
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  async #parseCsvSchoolsContent({
    csvParser,
    sourceFileName,
    csvTransformer,
    destinationFileName,
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
      `./tmp-files/${destinationFileName}.csv`,
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

    return new Promise<string>((resolve, reject) => {
      destinationStream.addListener("finish", () => {
        sourceStream.close();
        destinationStream.close(() => {
          resolve(`tmp-files/${destinationFileName}.csv`);
        });
      });

      destinationStream.addListener("error", (error) => {
        reject(error.message);
      });

      // Starts streaming process
      sourceStream.pipe(csvParser).pipe(csvTransformer).pipe(destinationStream);
    });
  }
}
