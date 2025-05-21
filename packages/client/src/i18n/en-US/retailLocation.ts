import type { RetailLocationInfo } from "src/models/retail-location";
import type { StatisticsTab } from "src/pages/statistics-page";

export default {
  errors: {
    noLocation: "No retail location has been selected.",
    couldNotUpdateInfo: "Could not update the selected content.",
  },
  statistics: {
    general: "General",
    delivery: "Deliveries",
    sale: "Sales",
    settle: "Settlements",
    return: "Returnings",
  } satisfies Record<StatisticsTab, string>,
  info: {
    faqContent: "FAQ",
    joinUsContent: "Join us",
    whoAreWeContent: "Who we are",
  } satisfies Record<RetailLocationInfo, string>,
  foregroundColor: "Text color",
  backgroundColor: "Background color",
};
