import { AvailableWarehouseFilterOptions } from "src/composables/use-filter-translations";
import { BookCopyStatus } from "src/helpers/book-copy";

export default {
  sortByCopyCode: "Ordina per codice copia cartacea",
  sortByISBN: "Ordina per ISBN",
  checkOtherWarehouse: "Consulta il magazzino di {0}",
  filters: {
    isAvailable: "Disponibili",
    isSold: "Venduti",
    hasProblems: "Con Problema",
  } satisfies Record<AvailableWarehouseFilterOptions, string>,
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
