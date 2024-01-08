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
    booked: "Prenotati",
    purchased: "Acquistati",
    available: "Disponibili",
    creationDate: "Data di Creazione",
    receipts: "Ricevute",
  },
  toolTips: {
    inStock:
      "Il numero di copie cartacee di uno o più titoli che l'utente ha consegnato e che si trovano attualmente in magazzino",
    sold: "Il numero di copie cartacee di uno o più titoli che l'utente ha già venduto",
    booked:
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
    discount: "Apply ISEE/voluntary discount",
  },
  inRetrieval: "In ritiro",
  retrieved: "Ritirati e restituibili",
  inStockDialog: {
    title: "Libri di {0} {1} in Magazzino",
    retrievableTooltip:
      "Include le copie ancora presenti in magazzino, non disperse, non prenotate",
    retrieveBtn: "Ritira tutti i libri nella lista",
    searchHint: "Inserisci un codice ISBN per aggiungere il libro alla lista",
  },
  booksMovementsDialog: {
    purchasedTitle: "Libri acquistati da {0} {1}",
    soldTitle: "Libri venduti da {0} {1}",
    purchasedAt: "Acquistato a",
    soldTo: "Venduto a",
    theVendor: "Il venditore",
  },
  actions: "Azioni",
};
