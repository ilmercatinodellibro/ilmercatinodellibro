import { ReceiptType } from "src/@generated/graphql";

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
    requested: "Richiesti",
    purchased: "Acquistati",
    creationDate: "Data di Creazione",
    receipts: "Ricevute",
    reserved: "Prenotati",
    cart: "Carrello",
  },
  tooltips: {
    inStock:
      "Il numero di copie cartacee di uno o più titoli che l'utente ha consegnato e che si trovano attualmente in magazzino",
    sold: "Il numero di copie cartacee di uno o più titoli che l'utente ha già venduto",
    reserved:
      "Il numero di titoli che l'utente ha prenotato e che non ha ancora acquistato. La lista include anche i libri Richiesti e quelli Disponibili",
    requested:
      "Il numero di copie cartacee di uno o più titoli che l'utente ha prenotato e che non ha ancora acquistato",
    purchased:
      "Il numero di copie cartacee di uno o più titoli che l'utente ha già acquistato",
    available:
      "Il numero di titoli attualmente disponibili tra quelli richiesti dall'utente",
  },
  payOff: "Liquida utente",
  payOffDisabled: "Le liquidazioni al momento sono disabilitate.",
  filters: {
    withAvailable: "Con Disponibili",
    withRequested: "Con Richiesti",
    withPurchased: "Con Acquistati",
    withSold: "Con Venduti",
  },
  editUser: {
    title: "Modifica Dati Utente",
    createUser: "Crea un Nuovo Utente",
    discount: "Applica sconto ISEE/volontario",
    notes: "Note",

    downloadData: "Scarica Dati",
    downloadDataSuccess: "I dati dell'account verranno scaricati a breve",
    downloadDataFailed:
      "Non è stato possibile scaricare i dati dell'account. Si prega di contattare il supporto.",
    deleteUser: "Elimina Utente",
    deleteUserSuccess:
      "L'utente è stato programmato per l'eliminazione tra 7 giorni",
    deleteUserFailed: "Non è stato possibile eliminare l'utente",
    cancelUserDeletion: "Annulla Eliminazione Utente",
    cancelUserDeletionSuccess: "L'eliminazione dell'utente è stata annullata",
    cancelUserDeletionFailed:
      "Non è stato possibile annullare l'eliminazione dell'utente",
  },
  inRetrieval: "In ritiro",
  inStock: "In magazzino",
  searchHint: "Inserisci un codice ISBN per aggiungere il libro alla lista",
  inStockDialog: {
    title: "Libri di {0} in Magazzino",
    retrievableTooltip:
      "Include le copie ancora presenti in magazzino, anche quelle con problemi o prenotate",
    retrieveBtn: "Ritira tutti i libri nella lista",
    deleteBookBtnTooltip: "Elimina definitivamente questa copia dal database",
    errors: {
      noBook: "Non è stato trovato nessun libro con ISBN {0}",
      retrieval: "C'è stato un errore nel ritiro dei libri",
    },
  },
  booksMovementsDialog: {
    purchasedTitle: "Libri acquistati da {0}",
    soldTitle: "Libri venduti da {0}",
    purchasedAt: "Acquistato il",
    soldTo: "Venduto a",
    purchasedBy: "Il venditore",
    reportProblem: "Segnala problema",
    solveProblem: "Risolvi problema",
    problemType: "Tipo di problema",
    details: "Dettagli",
    problemTypes: {
      LOST: "Perso",
      INCOMPLETE: "Incompleto",
      CUSTOM: "Personalizzato",
    },
    howResolved: "Come è stato risolto il problema?",
    problemsHistory: "Cronologia dei problemi",
    noProblems: "Questa copia non ha ancora avuto problemi",
    reportedBy: "Segnalato Da",
    resolutionDate: "Data Risoluzione",
    solution: "Soluzione",
    resolvedBy: "Risolto Da",
  },
  actions: "Azioni",
  requestedBooksDialog: {
    title: "Libri richiesti da {0}",
    titleNoName: "Libri Richiesti",
    deleteAll: "Elimina Tutti",
    moveIntoReserved: "Sposta i Disponibili nei Prenotati",
    moveIntoCart: "Metti i Disponibili nel Carrello",
    booksRequested: "",
  },
  reservedBooksDialog: {
    title: "Libri prenotati da {0}",
    deleteAllReserved: "Elimina tutti i Prenotati",
    moveAllIntoCart: "Metti Prenotati e Disponibili nel Carrello",
    reservedIntoCart: "Metti i Prenotati nel Carrello",
    requestStatus: "Stato Richiesta",
    confirmDialog: {
      title: "Elimina tutti i Libri Prenotati",
      message:
        'Stai eliminando tutti i libri prenotati da questo cliente. I libri verranno segnalati come "Disponibili". Vuoi procedere?',
      confirmButton: "Elimina Tutti",
    },
    bookReserved: "Prenotato {0}.",
    requestsReserved: "{0} copie di libri richiesti prenotate.",
  },
  payOffUserDialog: {
    title: "Liquida Utente {0}",
    soldBooksCountLabel: "Totale Libri dell'Utente Venduti ad Altri",
    totalPayOffLabel: "Totale Liquidabile all'Utente",
    totalCheckedOutLabel: "Totale Liquidato all'Utente",
    info: "Utilizza le checkbox delle righe per attivare le azioni di gruppo",
    buyPrice: "Prezzo d'acquisto",
    buyPriceTooltip:
      "È il prezzo concordato con il proprietario originale del libro e corrisponde alla somma che gli viene garantita in caso di vendita",
    publicPrice: "Prezzo al pubblico",
    publicPriceTooltip:
      "È il prezzo al quale il libro viene venduto dal Mercatino e corrisponde al prezzo d'acquisto maggiorato della percentuale trattenuta dal Mercatino",
    booksInStock: "Libri in Magazzino",
    soldBooks: "Libri venduti",
    returnedBooks: "Libri restituiti",
    returnOptions: {
      donate: "Dona al Mercatino",
      return: "Restituisci",
      reimburse: "Rimborsa",
    },
    problemsError:
      "Non è stato possibile segnalare il problema per tutte le copie.",
    returnAndDonate: "Restituisci contanti e dona libri",
    returnEverything: "Restituisci contanti e libri ({0} €)",
    confirms: {
      disclaimer:
        "Non potrai annullare questa azione dal dialog di liquidazione. Vuoi procedere?",
      donate: {
        title:
          "Dona libro al Mercatino del Libro | Dona libri al Mercatino del Libro",
        label:
          "Stai donando questa copia del libro al Mercatino del Libro. | Stai donando queste copie del/i libro/i al Mercatino del Libro.",
        confirmLabel: "Dona libro | Dona libro",
      },
      reimburse: {
        title: "Rimborsa libro al cliente | Rimborsa libri al cliente",
        label:
          "Stai rimborsando questa copia del libro al cliente proprietario. | Stai rimborsando queste copie del/i libro/i al cliente proprietario.",
        confirmLabel: "Rimborsa libro | Rimborsa libri",
      },
      returnAndDonate: {
        disclaimer:
          "I libri nella lista sottostante saranno donati dal cliente al Mercatino del Libro. Non potrai annullare questa azione. Vuoi procedere?",
        tableTitle: "Libri Donati al Mercatino",
        buttonText: "Restituisci contanti e dona libri ({0} €)",
      },
      returnEverything: {
        title: "Restituisci contanti e libri",
        disclaimer:
          "I libri nella lista sottostante saranno restituiti al cliente in quanto legittimo proprietario. Non potrai annullare questa azione. Vuoi procedere?",
        tableTitle: "Libri in restituzione",
      },
      confirmError:
        "Non è stato possibile terminare la liquidazione del cliente selezionato.",
    },
  },
  goToCart: "Vai al carrello",
  returnBookTitle: "Effettua il Reso del Libro",
  returnBook: "Effettua Reso",
  moneyToGive: "Soldi da rendere al Cliente",
  iseeInfoTooltip:
    "Questo utente ha diritto allo sconto e il totale da rendere ne tiene conto?",
  cartDialog: {
    title: "Carrello di {0}",
    emptyCart: "Svuota carrello",
    autoEmptyDisclaimer:
      "Ricorda: non puoi tenere i libri disponibili bloccati nel carrello per troppo tempo, perciò si svuoterà automaticamente tra: {0}",
    sellBooks: "Vendi libri ({0})",
    totalBooks: "Totale Libri da vendere",
    discount: "Sconto ISEE/volontario",
    total: "Totale",
    empty: {
      title: "Svuotare il carrello?",
      message:
        "Vuoi davvero svuotare il carrello del cliente attuale e ritornare i suoi libri tra le liste dei prenotati e dei richiesti?",
      emptyCart: "Svuota",
    },
    confirm: {
      title: "Vendi libri?",
      message:
        "Confermare la vendita dei libri nel carrello per un totale di {0}?",
      sell: "Vendi",
    },
  },
  receiptsDialog: {
    title: "Ricevute",
    createdBy: "Creata da",
    resend: "Invia di nuovo",
    resendSuccess:
      "Una nuova copia della ricevuta {type} è stata inviata all'indirizzo email dell'utente",
    type: {
      PURCHASE: "Acquisto | Acquisti",
      WITHDRAWAL: "Ritiro | Ritiri",
    } satisfies Record<ReceiptType, string>,
    noWithdrawal: "Non sono presenti ricevute di ritiro",
    noPurchase: "Non sono presenti ricevute d'acquisto",
  },
};
