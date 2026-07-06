// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import type { ImportBooksAndSchoolsService } from "src/modules/book/import-books-and-schools.service";
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import type { ImportBooksCommand } from "src/modules/book/import-books.command";

/**
 * Filenames for book and school CSV imports from the ministry.
 * These filenames are expected by both the import service and import command.
 * IMPORTANT: check both {@link ImportBooksAndSchoolsService} and
 * {@link ImportBooksCommand} before making changes in this file
 */

export const BOOK_IMPORT_FILENAME = "ALTEMILIAROMAGNA.csv";
export const PUBLIC_SCHOOLS_IMPORT_FILENAME = "SCUOLE_STATALI.csv";
export const PRIVATE_SCHOOLS_IMPORT_FILENAME = "SCUOLE_PARITARIE.csv";
