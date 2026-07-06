import type { RetailLocationInfo } from "src/models/retail-location";
import type { StatisticsTab } from "src/pages/statistics-page";

export default {
  errors: {
    noLocation: "Nessun mercatino selezionato.",
    couldNotUpdateInfo:
      "Non è stato possibile aggiornare i contenuti selezionati.",
  },
  statisticsTabs: {
    general: "Generali",
    delivery: "Consegne",
    sale: "Vendite",
    settle: "Liquidazioni",
    return: "Restituzioni",
  } satisfies Record<StatisticsTab, string>,
  statistics: {
    booksInTheSystem: "Libri movimentati",
    booksInWarehouse: "Libri in magazzino",
    salableBooks: "Libri in magazzino vendibili",
    booksWithProblemsInWarehouse: "Libri in magazzino con problemi",
    booksWithProblems: "Libri con problemi",
    returnedBooks: "Libri restituiti",
    donatedBooks: "Libri donati",
    reimbursedBooks: "Libri rimborsati",
    reimbursedAmount: "Totale rimborsato",
    activeRequests: "Richieste",
    totalReservations: "Prenotazioni totali",
    activeReservations: "Prenotazioni attive",
    reservationsWhichLedToASale: "Prenotazioni con vendita",
    reservationsWhichLedToARefundedSale: "Prenotazioni con vendita rimborsata",
    expiredReservations: "Prenotazioni scadute",
    reservationsDeletedByUsers: "Prenotazioni cancellate da utenti",
    sales: "Vendite",
    activeSales: "Vendite andate a buon fine",
    refundedSales: "Vendite con reso",
    settleable: "Liquidabile",
    toSettle: "Da liquidare",
    settled: "Liquidato",
    grossRevenue: "Guadagno lordo",
    netRevenue: "Guadagno netto",
    adminAccountsRevenue: "Guadagno da utente admin",
    activeUsers: "Utenti attivi",
    buyingCustomers: "Utenti che hanno comprato almeno un libro",
    sellingCustomers: "Utenti che hanno venduto almeno un libro",
    buyingOrSellingCustomers:
      "Utenti che hanno comprato o venduto almeno un libro",
    usersWithDiscount: "Utenti con sconto 35%",
    requestingUsers: "Utenti che hanno richiesto libri",
    purchasedOrSoldBooksAverage:
      "Media dei libri venduti o comprati per utente",
    soldBooksFromSellersAverage:
      "Media dei libri venduti da chi ha venduto almeno un libro",
    purchasedBooksFromBuyersAverage:
      "Media dei libri comprati da chi ha comprato almeno un libro",
    settleableMoneyAverage: "Media del denaro liquidabile per utente",
    activeUsersLanguage: "Utenti che hanno selezionato la lingua {locale}",
    soldBooksOriginalPriceTotal: "Totale prezzo di copertina libri venduti",
    sellingCustomersIncomeAverage:
      "Guadagno medio tra chi ha venduto almeno un libro",
    buyingCustomersFullExpenseAverage:
      "Spesa media al 100% per chi ha comprato almeno un libro",
    buyingCustomersDiscountedExpenseAverage:
      "Spesa media al {sellRate}% per chi ha comprato almeno un libro",
    buyingCustomersSavingAverage:
      "Risparmio medio per chi ha comprato almeno un libro",
  },
  info: {
    faqContent: "FAQ",
    joinUsContent: "Unisciti a noi",
    whoAreWeContent: "Chi siamo",
  } satisfies Record<RetailLocationInfo, string>,
  foregroundColor: "Colore testo",
  highlightColor: "Colore di sfondo",
};
