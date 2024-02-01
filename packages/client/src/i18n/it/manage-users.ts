export default {
  createUser: "Crea nuovo utente",
  filter: "Filtra",
  search: "Cerca",
  fields: {
    email: "Email",
    firstName: "Nome",
    lastName: "Cognome",
    phoneNumber: "Telefono",
    inStock: "In Magazzino",
    sold: "Venduti",
    requested: "Prenotati",
    purchased: "Acquistati",
    available: "Disponibili",
    creationDate: "Data di Creazione",
    receipts: "Ricevute",
  },
  toolTips: {
    inStock:
      "Il numero di copie cartacee di uno o più titoli che l'utente ha consegnato e che si trovano attualmente in magazzino",
    sold: "Il numero di copie cartacee di uno o più titoli che l'utente ha già venduto",
    requested:
      "Il numero di copie cartacee di uno o più titoli che l'utente ha prenotato e che non ha ancora acquistato",
    purchased:
      "Il numero di copie cartacee di uno o più titoli che l'utente ha già acquistato",
    available:
      "Il numero di titoli attualmente disponibili tra quelli richiesti dall'utente",
  },
  payOff: "Liquida utente",
  filters: [
    "Con Disponibili",
    "Con Richiesti",
    "Con Acquistati",
    "Con Venduti",
  ],
  editUser: {
    title: "Modifica Dati Utente",
    notes: "Note",
    discount: "Applica sconto ISEE/volontario",
  },
  inRetrieval: "In ritiro",
  retrieved: "Ritirati e restituibili",
  inStockDialog: {
    title: "Libri di {0} {1} in Magazzino",
    retrievableTooltip:
      "Include le copie ancora presenti in magazzino, non disperse, non prenotate",
    retrieveBtn: "Ritira tutti i libri nella lista",
    searchHint: "Inserisci un codice ISBN per aggiungere il libro alla lista",
    deleteBookBtnTooltip: "Elimina definitivamente questa copia dal database",
  },
  booksMovementsDialog: {
    purchasedTitle: "Libri acquistati da {0} {1}",
    soldTitle: "Libri venduti da {0} {1}",
    purchasedAt: "Acquistato a",
    soldTo: "Venduto a",
    theVendor: "Il venditore",
    reportProblem: "Segnala problema",
    solveProblem: "Risolvi problema",
  },
  actions: "Azioni",
  requestedBooksDialog: {
    title: "Libri prenotati da {0} {1}",
  },
  checkOutUserDialog: {
    title: "Liquida Utente {0} {1}",
    soldBooksCountLabel: "Totale Libri dell'Utente Venduti ad Altri",
    totalCheckOutLabel: "Totale Liquidabile all'Utente",
    totalCheckedOutLabel: "Totale Liquidato all'Utente",
    info: "Utilizza le checkbox delle righe per attivare le azioni di gruppo",
    buyPrice: "Prezzo d'acquisizione",
    buyPriceTooltip:
      "È il prezzo concordato con il proprietario originale del libro e corrisponde alla somma che gli viene garantita in caso di vendita",
    publicPrice: "Prezzo al Pubblico",
    publicPriceTooltip:
      "È il prezzo al quale il libro viene venduto dal Mercatino e corrisponde al Prezzo d'acquisizione maggiorato della percentuale trattenuta dal Mercatino",
    booksInStock: "Libri in Magazzino",
    soldBooks: "Libri venduti",
    returnedBooks: "Libri restituiti",
    returnOptions: {
      donate: "Dona al Mercatino",
      return: "Restituisci",
      repay: "Rimborsa",
    },
    returnAndDonate: "Restituisci contanti e dona libri",
    returnEverything: "Restituisci contanti e libri",
  },
};
