import { Role } from "src/@generated/graphql";

export default {
  mainNavigation: "Principale",
  username: "Nome utente",
  safety: "Sicurezza",
  noResults: "Nessun risultato",
  noElementIsPresent: "Non è presente alcun elemento",
  saves: "Preferiti",
  oopsNothingHere: "Oops. Niente qui",
  goHome: "Torna alla home",
  home: "Home",
  default: "default",
  filters: "Filtri",
  confirmRequest: "Richiesta conferma",
  typeAtLeastNChars: "Inserisci almeno {charCount} caratteri",
  helpAndFeedback: "Chiedi aiuto o fornisci suggerimenti",
  feedbackRequestSent: "Richiesta inviata con successo",
  enterMessage: "Inserisci messaggio",
  userRoleUpdated: "Ruolo utente aggiornato",
  userRemoved: "Utente rimosso",
  inviteSent: "Invito inviato con successo",
  noSearchResults: "Non ci sono risultati corrispondenti alla tua ricerca",
  all: "Tutto",
  cannotLoadImage: "Impossibile caricare l'immagine",
  uploadLogo: "Carica logo",
  resetLogo: "Ripristina logo",
  primary: "Primario",
  secondary: "Secondario",
  accent: "Accento",
  colorPicker: "Selettore colore",
  removeUserMessage:
    "Stai rimuovendo questo utente dalla lista degli Operatori per questa Sede. Vuoi procedere?",
  language: "Lingua",
  myData: "I Miei Dati",
  warehouse: "Magazzino",
  reserveBooks: "Prenota Libri",
  myBooks: "I Miei Libri",
  salableBooks: "Libri Vendibili",
  saveChanges: "Salva modifiche",
  themeChanged: "Tema aggiornato!",
  leaveWithoutSaving: "Vuoi uscire dalla pagina senza salvare?",
  logoSizeMessage:
    "Il logo deve essere un png o svg e deve avere una larghezza minima di 400px",
  tooltips: {
    warehouse: "Contiene la lista di tutte le copie cartacee registrate",
    catalog:
      "Contiene la lista di tutti i titoli rilasciati dal Ministero per le classi di tutte le scuole della provincia",
    usersAndMovements:
      "Contiene le funzionalità per gestire i dati degli Utenti registrati e la compravendita dei libri",
    reserveBooks:
      "Accedi a questa pagina per prenotare i libri che vuoi acquistare. Puoi anche richiedere i libri al momento non disponibili.",
    myBooks:
      "Accedi a questa pagina per conoscere lo stato dei libri che ci hai consegnato da vendere, delle tue prenotazioni, e degli acquisti che hai fatto.",
    salableBooks:
      "Accedi a questa pagina per verificare quali libri accettiamo tra quelli che vuoi vendere.",
  },
  joinUs: "Unisciti a noi",
  whoWeAre: "Chi siamo",
  faq: "FAQ",
  loading: "Caricamento in corso...",
  settings: {
    resetToolTip:
      "Effettua il reset di tutti i dati di sistema per predisporre il software alle attività dell'anno successivo",
    purchaseRate: "Aliquota Acquisto",
    saleRate: "Aliquota Vendita",
    reservationDays: "Numero di Giorni per Prenotazione",
    maxBooksDimension:
      "Dimensione max dei blocchi di libri da inserire per permettere la frammentazione",
    payOffEnabled: "Abilita la possibilità di effettuare liquidazioni",
    updateRatesConfirmTitle: "Aggiornare l'aliquota di acquisto/vendita?",
    updateRatesConfirmMessage:
      "ATTENZIONE: stai aggiornando le aliquote di acquisto e/o vendita; assicurati che questo sia effettuato solamente all'inizio o alla fine del periodo di attività del Mercatino.",
    resetMessage:
      "Stai effettuando il reset di tutti i dati di sistema per predisporre il software alle attività dell'anno successivo. Vuoi procedere?",
    resetButton: "Effettua reset annuale",
    resetConfirmButton: "Effettua reset",
  },
  role: "Ruolo",
  rolesAndPermissions: {
    filters: {
      // customer: "Clienti",
      OPERATOR: "Operatori",
      ADMIN: "Amministratori",
    } satisfies Record<Role, string>,
    addNewOperator: {
      title: "Aggiungi Operatore",
      message:
        "Gli operatori hanno i permessi per accedere alle pagine di gestione (Magazzino, Catalogo, Utenti e Movimenti) e alle loro funzionalità.",
    },
    operatorAdded: "L'operatore è stato aggiunto con successo.",
  },
};
