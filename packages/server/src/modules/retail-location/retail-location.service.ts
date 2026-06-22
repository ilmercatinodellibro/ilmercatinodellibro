import { cp, mkdir, rm, writeFile, open } from "node:fs/promises";
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

  resolveStoragePath(locationId: string, path?: string) {
    return resolve(
      this.rootConfig.storagePath,
      `./location/${locationId}`,
      path ?? "",
    );
  }

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
    const backupDirectory = this.resolveStoragePath(
      locationId,
      `./backups/${new Date().toISOString()}`,
    );
    // Ensure the directory exists
    await mkdir(backupDirectory, { recursive: true });

    for (const [key, value] of Object.entries(backup)) {
      const stringifier = stringify(value, { header: true });
      const file = resolve(backupDirectory, `./${key}.csv`);
      filePromises.push(writeFile(file, stringifier, { encoding: "utf-8" }));
    }

    const receiptsDirectory = this.resolveStoragePath(locationId, "./receipts");
    filePromises.push(
      cp(receiptsDirectory, resolve(backupDirectory, "./receipts"), {
        recursive: true,
      }),
    );

    try {
      await Promise.all(filePromises);
      // TODO: zip the backup receipts directory
    } catch (error) {
      try {
        await rm(backupDirectory, { recursive: true, force: true });
      } catch {
        // nothing to do
      }

      throw error;
    }
  }

  async cleanupLocation(locationId: string) {
    await this.prisma.$transaction([
      // Notifications don't cascade when deleting related events,
      // we must delete them beforehand
      this.prisma.notification.deleteMany({
        where: {
          event: {
            locationId,
          },
        },
      }),
      this.prisma.retailLocation.update({
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
          events: {
            deleteMany: {},
          },
        },
      }),
      this.prisma.school.deleteMany({
        where: {
          provinceCode: {
            equals: locationId,
            mode: "insensitive",
          },
        },
      }),
      // Users aren't associated to a location, but we can clean up unverified users and soft deleted ones
      this.prisma.user.deleteMany({
        where: {
          OR: [
            {
              deletedAt: {
                not: null,
              },
            },
            { emailVerified: false },
          ],
        },
      }),
    ]);

    const receiptsDirectory = this.resolveStoragePath(locationId, "./receipts");
    await rm(receiptsDirectory, { recursive: true, force: true });
    // Create the directory again
    await mkdir(receiptsDirectory);
    // Recreates the .gitkeep file to keep the directory in version control
    const gitkeepPath = resolve(receiptsDirectory, ".gitkeep");
    const gitkeepHandle = await open(gitkeepPath, "a");
    await gitkeepHandle.close();
  }
}
