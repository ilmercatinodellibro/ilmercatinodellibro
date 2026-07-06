import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  HttpException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { RootConfiguration, rootConfiguration } from "src/config/root";
import { AuthService } from "src/modules/auth/auth.service";
import {
  BOOK_IMPORT_FILENAME,
  PUBLIC_SCHOOLS_IMPORT_FILENAME,
  PRIVATE_SCHOOLS_IMPORT_FILENAME,
} from "src/modules/book/book-import.constants";
import { ImportBooksCommand } from "src/modules/book/import-books.command";
import { PrismaService } from "src/modules/prisma/prisma.service";
import type {
  ImportBooksResult,
  ImportSchoolsResult,
} from "src/modules/book/book.args";

@Injectable()
export class ImportBooksAndSchoolsService {
  private readonly logger = new Logger(ImportBooksAndSchoolsService.name);
  private readonly tmpPath: string;

  private readonly FETCH_TIMEOUT_MS = 60 * 1000; // 1 minute

  private readonly BOOKS_URL_PATTERN =
    /^https:\/\/dati\.istruzione\.it\/opendata\/opendata\/catalogo\/elements1\/ALTEMILIAROMAGNA\w*\.csv$/;
  private readonly PUBLIC_SCHOOLS_URL_PATTERN =
    /^https:\/\/dati\.istruzione\.it\/opendata\/opendata\/catalogo\/elements1\/SCUANAGRAFESTAT\w*\.csv$/;
  private readonly PRIVATE_SCHOOLS_URL_PATTERN =
    /^https:\/\/dati\.istruzione\.it\/opendata\/opendata\/catalogo\/elements1\/SCUANAGRAFEPAR\w*\.csv$/;

  private isImporting = false;

  constructor(
    @Inject(rootConfiguration.KEY)
    rootConfig: RootConfiguration,
    private readonly prisma: PrismaService,
    private readonly importBooksCommand: ImportBooksCommand,
    private readonly authService: AuthService,
  ) {
    this.tmpPath = resolve(rootConfig.storagePath, "./tmp");
  }

  async importBooksFromUrl(
    booksUrl: string,
    userId: string,
    retailLocationId?: string,
  ): Promise<ImportBooksResult> {
    await this.authService.assertMembership({
      userId,
      retailLocationId,
      role: Role.ADMIN,
    });

    if (this.isImporting) {
      throw new ConflictException(
        "An import operation is already in progress. Please wait for it to complete.",
      );
    }

    this.isImporting = true;

    try {
      this.validateUrlPattern(
        booksUrl,
        this.BOOKS_URL_PATTERN,
        "Invalid books URL",
      );
      this.logger.log("Starting books import from URL");

      await this.downloadFile(booksUrl, BOOK_IMPORT_FILENAME);
      const result = await this.importBooksCommand.loadBooks();

      return {
        currentDbBooksCount: result,
      };
    } catch (error) {
      this.logger.error("Error importing books:", error);
      throw this.handleError(error, "Failed to import books");
    } finally {
      this.isImporting = false;
    }
  }

  async importSchoolsFromUrls(
    publicSchoolsUrl: string,
    privateSchoolsUrl: string,
    userId: string,
    retailLocationId?: string,
  ): Promise<ImportSchoolsResult> {
    await this.authService.assertMembership({
      userId,
      retailLocationId,
      role: Role.ADMIN,
    });

    if (this.isImporting) {
      throw new ConflictException(
        "An import operation is already in progress. Please wait for it to complete.",
      );
    }

    this.isImporting = true;

    try {
      const booksCount = await this.prisma.book.count();

      if (booksCount === 0) {
        throw new BadRequestException(
          "No books found in the database. Please import books first.",
        );
      }

      this.validateUrlPattern(
        publicSchoolsUrl,
        this.PUBLIC_SCHOOLS_URL_PATTERN,
        "Invalid public schools URL",
      );
      this.validateUrlPattern(
        privateSchoolsUrl,
        this.PRIVATE_SCHOOLS_URL_PATTERN,
        "Invalid private schools URL",
      );

      this.logger.log("Starting schools import from URLs");

      const schoolsController = new AbortController();
      try {
        await Promise.all([
          this.downloadFile(
            publicSchoolsUrl,
            PUBLIC_SCHOOLS_IMPORT_FILENAME,
            schoolsController,
          ),
          this.downloadFile(
            privateSchoolsUrl,
            PRIVATE_SCHOOLS_IMPORT_FILENAME,
            schoolsController,
          ),
        ]);
      } catch (error) {
        schoolsController.abort();
        throw error;
      }

      await this.importBooksCommand.loadSchools();

      const [schoolCount, coursesCount, booksOnCoursesCount] =
        await Promise.all([
          this.prisma.school.count(),
          this.prisma.schoolCourse.count(),
          this.prisma.booksOnCourses.count(),
        ]);

      return {
        schoolCount,
        coursesCount,
        booksOnCoursesCount,
      };
    } catch (error) {
      this.logger.error("Error importing schools:", error);
      throw this.handleError(error, "Failed to import schools");
    } finally {
      this.isImporting = false;
    }
  }

  private handleError(error: unknown, context: string) {
    if (error instanceof HttpException) {
      return error;
    }

    if (error instanceof Error) {
      return new InternalServerErrorException(`${context}: ${error.message}`);
    }

    return new InternalServerErrorException(context);
  }

  private async downloadFile(
    sourceUrl: string,
    destinationFilename: string,
    sharedController?: AbortController,
  ) {
    this.logger.log(`Downloading ${destinationFilename} from ${sourceUrl}`);

    const controller = sharedController ?? new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(sourceUrl, {
        redirect: "manual",
        signal: controller.signal,
      });

      if (response.status >= 300 && response.status < 400) {
        throw new BadRequestException("Redirects are not allowed");
      }

      if (!response.ok) {
        throw new Error(
          `Failed to download file: ${response.status} ${response.statusText}`,
        );
      }

      const contentType = response.headers.get("content-type");

      // Ministry should return application/octet-stream
      if (contentType !== "application/octet-stream") {
        throw new BadRequestException(
          "The selected address did not return a CSV",
        );
      }

      const buffer = await response.arrayBuffer();

      const filePath = resolve(this.tmpPath, destinationFilename);
      await writeFile(filePath, Buffer.from(buffer));

      this.logger.log(`File ${destinationFilename} downloaded successfully`);
    } catch (error) {
      // See https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new BadRequestException(
          `Download timeout: request took longer than ${this.FETCH_TIMEOUT_MS / 1000} seconds`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private validateUrlPattern(
    url: string,
    pattern: RegExp,
    errorMessage: string,
  ) {
    try {
      new URL(url);
    } catch {
      throw new BadRequestException("Invalid URL");
    }

    if (!pattern.test(url)) {
      throw new BadRequestException(errorMessage);
    }
  }
}
