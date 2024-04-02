/* eslint-disable no-console */
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
import { PrismaClient } from "@prisma/client";
import { parse, transform } from "csv";
import { Command, CommandRunner, Option } from "nest-commander";
import { School } from "src/@generated";
import {
  IngestedCsvRow,
  IngestedEquivalentSchoolRow,
  IngestedStateSchoolRow,
  SchoolCourseDto,
  SchoolCsvConfiguration,
} from "./book-csv.types";

interface ImportBooksCommandOptions {
  school?: string;
}

@Command({
  name: "import",
  description: "Imports Books or Schools into the database",
})
export class ImportBooksCommand extends CommandRunner {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  @Option({
    flags: "-s, --school",
    description:
      "Use this option if the app needs to import Schools instead of books",
  })
  parseString(val: string): string {
    return val;
  }

  async run(_: string[], options?: ImportBooksCommandOptions): Promise<void> {
    try {
      if (options?.school) {
        await this.loadSchools();
      } else {
        await this.loadBooks();
      }
    } finally {
      // No need to catch, the error must break the execution, but it is still better to make sure we're closing prisma connection.
      await this.prisma.$disconnect();
    }

    return;
  }

  async loadBooks() {
    if ((await this.prisma.book.count()) > 0) {
      throw new Error(
        "There are books inside the database. Please make sure you have run the procedure to reset the contents of the database during the close year process.",
      );
    }

    console.log("Importing books...");

    try {
      const result = await this.#loadBooksIntoDb();

      if (!result) {
        throw new Error(
          "Unable to process and import the books from the source file.",
        );
      }

      const importedBooksCount = await this.prisma.book.count();
      console.log(`Imported ${importedBooksCount} books.`);

      return importedBooksCount;
    } catch (error) {
      console.error("Cannot load books, error: ", error);
      throw new Error("Cannot import or process files on server.");
    }
  }

  async loadSchools() {
    console.log("Importing schools and courses...");

    if ((await this.prisma.book.count()) === 0) {
      throw new Error(
        "No books found in the database. Please import books first.",
      );
    }

    const existingSchoolData = await this.#getSchoolAndCoursesData();
    if (existingSchoolData.booksOnCoursesCount > 0) {
      throw new Error(
        `There are either schools(${existingSchoolData.schoolCount}) or courses(${existingSchoolData.coursesCount}) or book courses(${existingSchoolData.booksOnCoursesCount}). Make sure you have run the yearly reset procedure of the database.`,
      );
    }

    try {
      const result = await this.#loadSchoolsIntoDb();

      if (!result) {
        throw new Error(
          "Unable to process and import the schools and the courses from the source files.",
        );
      }

      const { booksOnCoursesCount, schoolCount, coursesCount } =
        await this.#getSchoolAndCoursesData();
      console.log(
        `Imported ${schoolCount} schools, for a total of ${coursesCount} courses having a total of ${booksOnCoursesCount} books.`,
      );

      return result;
    } catch (error) {
      console.error("Cannot load schools, error: ", error);
      throw new Error(
        "Could not find/process the CSV files or create DB entries.",
      );
    }
  }

  async #getSchoolAndCoursesData() {
    const [schoolCount, coursesCount, booksOnCoursesCount] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.schoolCourse.count(),
      this.prisma.booksOnCourses.count(),
    ]);

    return {
      schoolCount,
      coursesCount,
      booksOnCoursesCount,
      totalCount: schoolCount + coursesCount + booksOnCoursesCount,
    };
  }

  async #loadBooksIntoDb() {
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
      throw new Error("The CSV file was not found.");
    }

    const dataDestination = joinPath(
      process.cwd(),
      "./tmp-files/books-source.csv",
    );

    rmSync(dataDestination, { force: true });

    const sourceStream = createReadStream(dataSource);
    const destinationStream = createWriteStream(dataDestination);
    const locationBooks: Record<string, string[]> = {};
    const schoolCoursesMap = new Map<string, SchoolCourseDto[]>();

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

  async #loadSchoolsIntoDb(locationsPrefixes: string[] = ["MO", "RE"]) {
    const schoolCodes: Record<string, string[]> = {};
    const schoolCodesList: string[] = [];
    const schoolCodesFromBooksCsv = readFileSync(
      joinPath(process.cwd(), "./tmp-files/school_codes.csv"),
      "utf-8",
    ).split("\n");

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

      await this.#loadCoursesIntoDb(locationsPrefixes);

      return true;
    } catch (e) {
      console.error("Error occurred during import of Schools.", e);
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
      throw new Error(
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

  async #loadCoursesIntoDb(locationsPrefixes: string[]) {
    if (locationsPrefixes.length === 0) {
      return false;
    }

    const coursesData = JSON.parse(
      readFileSync(
        joinPath(process.cwd(), "./tmp-files/school_courses.json"),
      ).toString(),
    ) as Record<string, SchoolCourseDto[] | undefined>;

    for (const prefix of locationsPrefixes) {
      const [locationSchools, locationBooks] = await Promise.all([
        this.prisma.school.findMany({
          select: {
            code: true,
          },
          where: {
            provinceCode: {
              equals: prefix,
              mode: "insensitive",
            },
          },
        }),
        this.prisma.book.findMany({
          select: {
            id: true,
            isbnCode: true,
            retailLocationId: true,
          },
          where: {
            retailLocationId: {
              equals: prefix,
              mode: "insensitive",
            },
          },
        }),
      ]);

      for (const { code: schoolCode } of locationSchools) {
        const schoolCourses = coursesData[schoolCode];
        if (!schoolCourses) {
          continue;
        }

        for (const course of schoolCourses) {
          const savedCourse = await this.prisma.schoolCourse.create({
            data: {
              section: course.section,
              grade: parseInt(course.year),
              schoolCode,
            },
          });

          // When inserting a Book, if one ISBN code is not found, we skip inserting that book
          const validBooks = course.booksIsbn
            .map((isbnCode) => ({
              schoolCourseId: savedCourse.id,
              bookId: locationBooks.find((book) => book.isbnCode === isbnCode)
                ?.id,
            }))
            .filter(({ bookId }) => !!bookId) as {
            schoolCourseId: string;
            bookId: string;
          }[];

          await this.prisma.booksOnCourses.createMany({
            data: validBooks,
          });
        }
      }
    }

    return true;
  }
}