import { BookCopyQueryFilter } from "src/@generated/graphql";

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
    lost: "Perso",
    returned: "Restituito",
    donated: "Donato al Mercatino",
    incomplete: "Incompleto",
    "not-available": "Non Disponibile",
    available: "Disponibile",
    sold: "Venduto",
  },
};
