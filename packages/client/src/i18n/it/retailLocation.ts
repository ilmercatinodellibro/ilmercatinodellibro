import type { RetailLocationInfo } from "src/models/retail-location";
import type { StatisticsTab } from "src/pages/statistics-page";

export default {
  errors: {
    noLocation: "Nessun mercatino selezionato.",
    couldNotUpdateInfo:
      "Non è stato possibile aggiornare i contenuti selezionati.",
  },
  statistics: {
    general: "Generali",
    delivery: "Consegne",
    sale: "Vendite",
    settle: "Liquidazioni",
    return: "Restituzioni",
  } satisfies Record<StatisticsTab, string>,
  info: {
    faqContent: "FAQ",
    joinUsContent: "Join Us",
    whoAreWeContent: "Who We Are",
  } satisfies Record<RetailLocationInfo, string>,
  foregroundColor: "Colore testo",
  backgroundColor: "Colore sfondo",
};
