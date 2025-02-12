import { StatisticsTab } from "src/pages/statistics-page";

export default {
  errors: {
    noLocation: "Nessun mercatino selezionato.",
  },
  statistics: {
    general: "Generali",
    delivery: "Consegne",
    sale: "Vendite",
    settle: "Liquidazioni",
    return: "Restituzioni",
  } satisfies Record<StatisticsTab, string>,
};
