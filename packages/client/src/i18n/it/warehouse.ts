import { BookCopyQueryFilter } from "src/@generated/graphql";
import { BookCopyStatus } from "src/helpers/book-copy";

export default {
  sortByCopyCode: "Ordina per codice copia cartacea",
  sortByISBN: "Ordina per ISBN",
  checkOtherWarehouse: "Consulta il magazzino di {0}",
  filters: {
    isAvailable: "Disponibili",
    isSold: "Venduti",
    hasProblem: "Con Problema",
  } satisfies Record<Exclude<keyof BookCopyQueryFilter, "search">, string>,
  owner: "Proprietario",
  bookCopyStatus: {
    LOST: "Perso",
    returned: "Restituito",
    donated: "Donato al Mercatino",
    INCOMPLETE: "Incompleto",
    "not-available": "Non Disponibile",
    available: "Disponibile",
    sold: "Venduto",
  } satisfies Record<BookCopyStatus, string>,
};
