import { BookCopyQueryFilter } from "src/@generated/graphql";
import { BookCopyStatus } from "src/helpers/book-copy";

export default {
  searchPlaceholder: "Digita almeno 3 caratteri per cercare",
  sortByCopyCode: "Ordina per codice copia cartacea",
  sortByISBN: "Ordina per ISBN",
  checkOtherWarehouse: "Consulta il magazzino di {0}",
  availabilityTooltip: [
    "Totali: {copiesCount}",
    "Con problemi: {problemsCount}",
    "Venduti: {soldCount}",
    "Prenotati: {reservationsCount}",
    "Nel carrello: {cartItemsCount}",
    "Donati: {donatedCount}",
  ].join("\n"),
  filters: {
    isAvailable: "Disponibili",
    isSold: "Venduti",
    hasProblems: "Con Problema",
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
    inStock: "In Magazzino",
    reimbursed: "Rimborsato",
  } satisfies Record<BookCopyStatus | "inStock", string>,
};
