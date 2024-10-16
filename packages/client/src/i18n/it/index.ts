import { Role } from "src/@generated/graphql";
import retailLocation from "src/i18n/it/retailLocation";
import {
  AdditionalMacroIntervalDurationNames,
  AvailableQuickRanges,
} from "src/models/date-time";
import { AvailableRouteNames } from "src/models/routes";
import actions from "./actions";
import auth from "./auth";
import book from "./book";
import bookErrors from "./book-errors";
import contacts from "./contacts";
import events from "./events";
import general from "./general";
import home from "./home";
import manageUsers from "./manage-users";
import myBooks from "./my-books";
import network from "./network";
import reserveBooks from "./reserve-books";
import salableBooks from "./salable-books";
import validators from "./validators";
import warehouse from "./warehouse";

const durationNames = {
  day: "Giorni",
  week: "Settimane",
  month: "Mesi",
  year: "Anni",
  custom: "Personalizzato",
};

const durations = {
  year: "Anno",
  month: "Mese",
  intervalsDuration: "Durata degli intervalli",
};

export default {
  actions,
  auth,
  book,
  contacts,
  durationNames,
  durations,
  events,
  general,
  home,
  manageUsers,
  myBooks,
  reserveBooks,
  network,
  salableBooks,
  validators,
  retailLocation,
  warehouse,
  bookErrors,

  common: {
    or: "Oppure",
    ok: "OK",
    close: "Chiudi",
    cancel: "Annulla",
    delete: "Elimina",
    back: "Indietro",
    next: "Avanti",

    from: "Da",
    to: "A",

    confirm: "Conferma",
    save: "Salva",
    add: "Aggiungi",
    edit: "Modifica",

    genericErrorMessage: "Si è verificato un errore! Riprova più tardi.",
    error: "Errore",

    search: "Cerca",
    filterBy: "Filtra per {field}",

    name: "Nome",
    date: "Data",
    connected: "Connesso",
    notConnected: "Non Connesso",
  },

  roleMap: {
    ADMIN: "Amministratore",
    OPERATOR: "Operatore",
  } satisfies Record<Role, string>,
  groupingOptions: {
    none: "Nessun raggruppamento",
    hour: "Ore",
    ...durationNames,
  },
  new: {
    f: "Nuova",
    m: "Nuovo",
  },
  quickRanges: {
    today: "Oggi",
    thisWeek: "Settimana corrente",
    thisMonth: "Mese corrente",
    thisYear: "Anno corrente",
    yesterday: "Ieri",
    lastWeek: "Settimana scorsa",
    lastMonth: "Mese scorso",
    lastYear: "Anno scorso",
    custom: "Personalizzato",
  } satisfies Record<
    AvailableQuickRanges & AdditionalMacroIntervalDurationNames,
    string
  >,
  pushNotifications: {
    unsupported: "Il tuo browser non supporta le notifiche push",
    subscribe: "Iscriviti alle notifiche",
    unsubscribe: "Annulla iscrizione alle notifiche",
    subscribing: "Iscrizione alle notifiche in corso...",
    unsubscribing: "Annullamento iscrizione alle notifiche in corso...",
    subscribeError:
      "Si è verificato un errore durante l'iscrizione alle notifiche",
    unsubscribeError:
      "Si è verificato un errore durante l'annullamento dell'iscrizione alle notifiche",
    permissionDenied:
      "Hai negato il permesso di inviare notifiche. Puoi cambiarlo nelle impostazioni del tuo browser.",
    subscribeSuccess: "Ti sei iscritto con successo alle notifiche",
    unsubscribeSuccess: "Ti sei disiscritto con successo dalle notifiche",

    permissionDialog: {
      title: "Permetti le notifiche push",
      message: "Vuoi ricevere le notifiche?",
      allow: "Permetti",
      later: "Più tardi",
      imageAlt: {
        chromium:
          "Finestra di dialogo del permesso di notifica nei browser basati su Chromium",
        firefox:
          "Finestra di dialogo del permesso di notifica nel browser Firefox",
        safari:
          "Finestra di dialogo del permesso di notifica nel browser Safari",
      },
      imageError: "Impossibile caricare l'immagine",
    },
  },
  routesNames: {
    [AvailableRouteNames.Contacts]: "Contatti",
    [AvailableRouteNames.Events]: "Eventi",
    [AvailableRouteNames.Catalog]: "Catalogo",
    [AvailableRouteNames.Home]: "Home",
    [AvailableRouteNames.ResetPassword]: "Reimposta password",
    [AvailableRouteNames.ForgotPassword]: "Password dimenticata",
    [AvailableRouteNames.ChangePassword]: "Cambia password",
    [AvailableRouteNames.RolesAndPermissions]: "Ruoli e Permessi",
    [AvailableRouteNames.RegisterWithToken]: "Invitare",
    [AvailableRouteNames.Login]: "Login",
    [AvailableRouteNames.SalableBooks]: "Libri vendibili",
    [AvailableRouteNames.UsersManagement]: "Utenti e Movimenti",
    [AvailableRouteNames.MyBooks]: "I Miei Libri",
    [AvailableRouteNames.ReserveBooks]: "Prenota Libri",
    [AvailableRouteNames.SelectLocation]: "Seleziona la tua sede",
    [AvailableRouteNames.MyData]: "I Miei Dati",
    [AvailableRouteNames.JoinUs]: "Unisciti a Noi",
    [AvailableRouteNames.WhoWeAre]: "Chi siamo",
    [AvailableRouteNames.Warehouse]: "Magazzino",
    [AvailableRouteNames.Statistics]: "Statistiche",
    [AvailableRouteNames.Registration]: "Registrazione",
    [AvailableRouteNames.RegistrationSent]: "Registrazione effettuata",
    [AvailableRouteNames.FAQ]: "FAQ",
  } satisfies Record<AvailableRouteNames, string>,
  sidebar: {
    settings: "Impostazioni",
  },
};
