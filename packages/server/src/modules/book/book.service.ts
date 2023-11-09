import { join as joinPath } from "path";
import { Injectable /*, UnprocessableEntityException */ } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const FILES_PATH = `${joinPath(
  process.cwd(),
  "tmp-files",
  "books-source.csv",
)}`;

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async loadBooksIntoDb() {
    //console.log("Show me details: ", FILES_PATH);

    // HAHA, no. This does not work. Because the DB is inside a docker instance. Thus it has no access to the outside world file instance
    await this.prisma.$executeRaw`
    COPY public."Book" 
    FROM ${FILES_PATH}
    WITH (FORMAT CSV, DELIMITER(','), HEADER MATCH);
    `;

    // console.log("result of operation: ", result);

    return false;
  }
}

// Loads all books from the given file:
// - Data is stored in resources/codes/<filename> which defaults to books.txt
// - Fields are identified by their name, when preceded by '@dummy', the info is useless and we do not save it
// - Fields delimiter is a semicolon (;) and fields data is enclosed in (")
// - The first line contain the header and for this is ignored
// - Line delimiter is line feed (\n), which is the default
//  See: https://tenerant.com/blog/using-load-data-local-infile-in-a-laravel-migration/
// NB: before executing this, cut it to only the RE rows with EmEditor,
//  and change the line terminator with LF instead of CRLF
//  (when loading the data on the server, it's converted to LF automatically and everything breaks)
//  convert the file to UTF8 encoding with 'iconv -f ISO-8859-1 -t UTF-8 <inputfilename> -o <outputfilename>'
// For latter problem
//      see: https://stackoverflow.com/questions/554960/how-can-i-stop-filezilla-changing-my-linebreaks
//      see: https://wiki.filezilla-project.org/Data_Type

// DB:: connection() -> getPdo() -> exec("LOAD DATA LOCAL INFILE '".
//             resource_path('data/' . ($this->argument('filename') ?: 'books.txt')) . "'
//             IGNORE INTO TABLE `mdl_libri`
//             FIELDS TERMINATED BY ';' ENCLOSED BY '\"'
//             IGNORE 1 LINES
//             (@dummyScuola,@dummyClasse,@dummySezione,@dummyTipoScuole,@dummyCombinazione,
//             materia,ISBN,autore,
//             @titolo,@sottotitolo,
//             @dummyVolume,
//             editore,prezzo_copertina,
//             @dummyNuovaAdozione,@dummyDaAcquistare,@dummyConsigliato)
//             SET titolo = CONCAT(@titolo, ' ', @sottotitolo);");
