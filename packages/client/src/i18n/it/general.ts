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
  feedbackRequestError:
    "Non siamo riusciti ad inviare la richiesta di contatto, contattaci tramite gli altri canali",
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
  unsavedChanges: "Modifiche non salvate",
  leavingWithoutSaving:
    "Stai abbandonando una scheda contenente modifiche non salvate. Prima di procedere esegui il salvataggio o perderai il lavoro svolto.",
  discardChanges: "Scarta modifiche",
  saveAndProceed: "Salva e procedi",
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
      "Numero massimo di libri ritirati oltre la quale la frammentazione viene disabilitata",
    registrationEnabled: "Abilita la possibilità di registrarsi",
    payOffEnabled: "Abilita la possibilità di effettuare liquidazioni",
    updateRatesConfirmTitle: "Aggiornare l'aliquota di acquisto/vendita?",
    updateRatesConfirmMessage:
      "ATTENZIONE: stai aggiornando le aliquote di acquisto e/o vendita; assicurati che questo sia effettuato solamente all'inizio o alla fine del periodo di attività del Mercatino.",
    resetMessage:
      "Stai effettuando il reset di tutti i dati di sistema per predisporre il software alle attività dell'anno successivo. Vuoi procedere?",
    resetButton: "Effettua reset annuale",
    resetConfirmButton: "Effettua reset",
    downloadUserList:
      "Scarica la lista degli utenti con e-mail verificata in un file CSV",
    downloadUserListSuccess:
      "Il download della lista degli utenti inizierà a breve",
    downloadUserListFailed:
      "Non è stato possibile scaricare la lista degli utenti. Contattate il supporto tecnico.",
    general: "Generali",
    importBooksAndSchools: {
      title: "Import libri e scuole",
      pasteUrlBooksDescription:
        "Incolla l'URL nel campo qui sotto e clicca il bottone per importare gli elenchi dei libri resi disponibile dal Ministero. Puoi recuperare l'URL per ottenere gli elenchi dei libri da questo link:",
      booksUrlLabel: "URL CSV Della Lista dei Libri dell'Emilia Romagna",
      importBooksButton: "Importa gli elenchi dei libri",
      pasteUrlSchoolsDescription:
        "Incolla gli URL nei campi qui sotto e clicca il bottone per importare gli elenchi delle scuole resi disponibili dal Ministero. Puoi recuperare gli URL per ottenere gli elenchi delle scuole da questo link:",
      schoolsImportWarning:
        "Importante: prima di poter importare gli elenchi delle scuole devi avere già importato l'elenco dei libri usando il campo qui sopra.",
      schoolsUrlLabel:
        "URL CSV della Lista Delle Scuole Statali dell'Emilia Romagna",
      schoolsPrivateUrlLabel:
        "URL CSV Della Lista Delle Scuole Paritarie dell'Emilia Romagna",
      importSchoolsButton: "Importa gli elenchi delle scuole",
      importSuccess: "Import riuscito",
      importBooksSuccessMessage:
        "Il processo di import è stato completato. Ora sono presenti {currentDbBooksCount} libri nel database.",
      importError: "Import non riuscito",
      importBooksErrorMessage:
        "Qualcosa è andato storto, l'operazione di import non è riuscita. Controlla di aver inserito l'URL corretto.",
      importSchoolsSuccessMessage:
        "Sono state importate {schoolCount} scuole, per un totale di {coursesCount} corsi comprendenti un totale di {booksOnCoursesCount} libri.",
      importSchoolsErrorMessage:
        "Qualcosa è andato storto, l'operazione di import non è riuscita. Controlla di aver inserito gli URL corretti.",
    },
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
