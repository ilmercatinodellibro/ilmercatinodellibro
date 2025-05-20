import { StatisticsTab } from "src/pages/statistics-page";

export default {
  errors: {
    noLocation: "No retail location has been selected.",
  },
  statistics: {
    general: "General",
    delivery: "Deliveries",
    sale: "Sales",
    settle: "Settlements",
    return: "Returnings",
  } satisfies Record<StatisticsTab, string>,
  faqContent: "FAQ",
  foregroundColor: "Text color",
  backgroundColor: "Background color",
};
