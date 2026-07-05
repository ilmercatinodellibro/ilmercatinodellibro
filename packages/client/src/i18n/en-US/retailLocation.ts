import type { RetailLocationInfo } from "src/models/retail-location";
import type { StatisticsTab } from "src/pages/statistics-page";

export default {
  errors: {
    noLocation: "No retail location has been selected.",
    couldNotUpdateInfo: "Could not update the selected content.",
  },
  statisticsTabs: {
    general: "General",
    delivery: "Deliveries",
    sale: "Sales",
    settle: "Settlements",
    return: "Returnings",
  } satisfies Record<StatisticsTab, string>,
  statistics: {
    booksInTheSystem: "Books in the system",
    booksInWarehouse: "Books in warehouse",
    salableBooks: "Salable books in warehouse",
    booksWithProblemsInWarehouse: "Books with problems in warehouse",
    booksWithProblems: "Books with problems",
    returnedBooks: "Returned books",
    donatedBooks: "Donated books",
    reimbursedBooks: "Reimbursed books",
    reimbursedAmount: "Total reimbursed",
    activeRequests: "Requests",
    totalReservations: "Total reservations",
    activeReservations: "Active reservations",
    reservationsWhichLedToASale: "Reservations with sale",
    sales: "Sales",
    activeSales: "Successful sales",
    refundedSales: "Sales with refund",
    settleable: "Settleable",
    toSettle: "To settle",
    settled: "Settled",
    grossRevenue: "Gross revenue",
    netRevenue: "Net revenue",
    adminAccountsRevenue: "Admin accounts revenue",
    activeUsers: "Active users",
    buyingCustomers: "Users who bought at least one book",
    sellingCustomers: "Users who sold at least one book",
    buyingOrSellingCustomers: "Users who bought or sold at least one book",
    usersWithDiscount: "Users with 35% discount",
    requestingUsers: "Users who requested books",
    purchasedOrSoldBooksAverage: "Average books sold or bought per user",
    soldBooksFromSellersAverage:
      "Average books sold by those who sold at least one book",
    purchasedBooksFromBuyersAverage:
      "Average books bought by those who bought at least one book",
    settleableMoneyAverage: "Average settleable money per user",
    activeUsersLanguage: "Users who selected {locale} language",
    soldBooksOriginalPriceTotal: "Total cover price of sold books",
    sellingCustomersIncomeAverage:
      "Average income among those who sold at least one book",
    buyingCustomersFullExpenseAverage:
      "Average expense at 100% for those who bought at least one book",
    buyingCustomersDiscountedExpenseAverage:
      "Average expense at {sellRate}% for those who bought at least one book",
    buyingCustomersSavingAverage:
      "Average savings for those who bought at least one book",
  },
  info: {
    faqContent: "FAQ",
    joinUsContent: "Join us",
    whoAreWeContent: "Who we are",
  } satisfies Record<RetailLocationInfo, string>,
  foregroundColor: "Text color",
  highlightColor: "Highlight color",
};
