import { cp, mkdir, rmdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Inject, Injectable } from "@nestjs/common";
import { stringify } from "csv";
import { omit } from "lodash";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class RetailLocationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(rootConfiguration.KEY)
    private readonly rootConfig: RootConfiguration,
  ) {}

  async backupLocation(locationId: string) {
    const { books, receipts } =
      await this.prisma.retailLocation.findUniqueOrThrow({
        where: {
          id: locationId,
        },
        select: {
          // carts do not have to be backed up, as they are temporary
          receipts: true,
          books: {
            include: {
              copies: {
                include: {
                  sales: true,
                  problems: true,
                },
              },
              requests: true,
              reservations: true,
              courses: true,
              // requestQueue do not have to be backed up, it's likely to not exist by the time of the reset anyway
            },
          },
        },
      });

    const copies = books.flatMap((book) => book.copies);
    const backup = {
      receipts,
      books: books.map((book) =>
        omit(book, ["copies", "requests", "reservations", "courses"]),
      ),
      requests: books.flatMap((book) => book.requests),
      reservations: books.flatMap((book) => book.reservations),
      courses: books.flatMap((book) => book.courses),
      copies: copies.map((copy) => omit(copy, ["problems", "sales"])),
      sales: copies.flatMap((copy) => copy.sales),
      problems: copies.flatMap((copy) => copy.problems),
    };

    const filePromises = [];
    const backupDirectory = resolve(
      this.rootConfig.fileSystemPath,
      `./location/${locationId}/backups/${Date.now()}`,
    );
    // Ensure the directory exists
    await mkdir(backupDirectory, { recursive: true });

    for (const [key, value] of Object.entries(backup)) {
      const stringifier = stringify(value, { header: true });
      const file = resolve(backupDirectory, `./${key}.csv`);
      filePromises.push(writeFile(file, stringifier, { encoding: "utf-8" }));
    }

    // TODO: update the receipts directory, we are currently copying all receipts, not just the ones from this retail location
    const receiptsDirectory = resolve(
      this.rootConfig.fileSystemPath,
      "./receipts",
    );
    filePromises.push(
      cp(receiptsDirectory, resolve(backupDirectory, "./receipts"), {
        recursive: true,
      }),
    );

    try {
      await Promise.all(filePromises);
    } catch (error) {
      try {
        await rmdir(backupDirectory, { recursive: true });
      } catch {
        // nothing to do
      }

      throw error;
    }
  }

  async cleanupLocation(locationId: string) {
    await this.prisma.retailLocation.update({
      where: {
        id: locationId,
      },
      data: {
        carts: {
          deleteMany: {},
        },
        receipts: {
          deleteMany: {},
        },
        books: {
          deleteMany: {
            // Deleting books will cascade to the relationships:
            // - copies
            // - requests
            // - reservations
            // - courses
            // - requestQueue
          },
        },
      },
    });

    // TODO: update the receipts directory, we are currently deleting all receipts, not just the ones from this retail location
    const receiptsDirectory = resolve(
      this.rootConfig.fileSystemPath,
      "./receipts",
    );
    await rmdir(receiptsDirectory, { recursive: true });
    // Create the directory again
    await mkdir(receiptsDirectory);
  }
}
